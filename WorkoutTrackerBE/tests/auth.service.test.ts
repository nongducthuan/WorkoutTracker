import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import bcrypt from "bcrypt";
import { AuthService } from "../src/services/auth.service";
import { ErrorCodes } from "../src/errors/appError";
import { setMailer, MailMessage } from "../src/services/mail.service";
import { hashRefreshToken } from "../src/utils/refreshToken.util";
import { generateOtpCode, safeCompare } from "../src/utils/otp.util";

const PASSWORD = "correct-horse-8";

const makeUser = (over: Record<string, any> = {}) => ({
  id: "11111111-1111-4111-8111-111111111111",
  fullName: "Quy Ha",
  userName: "quy",
  email: "quy@example.com",
  password: bcrypt.hashSync(PASSWORD, 4),
  avatarUrl: null,
  weightKg: null,
  heightCm: null,
  birthday: null,
  ...over,
});

const sentMails: MailMessage[] = [];

const makeRepos = (over: Record<string, any> = {}) => {
  const user = makeUser();
  return {
    userRepo: {
      findById: vi.fn().mockResolvedValue(user),
      findByUserNameOrEmail: vi.fn().mockResolvedValue(user),
      findByUserName: vi.fn().mockResolvedValue(null),
      findByEmail: vi.fn().mockResolvedValue(user),
      findByEmailExcludingUser: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue(user),
      update: vi.fn().mockResolvedValue(user),
      ...(over.userRepo ?? {}),
    },
    resetRepo: {
      create: vi.fn().mockResolvedValue({}),
      findLatestByUserId: vi.fn().mockResolvedValue(null),
      findByResetToken: vi.fn().mockResolvedValue(null),
      markVerified: vi.fn().mockResolvedValue({}),
      markUsed: vi.fn().mockResolvedValue({}),
      incrementAttempt: vi.fn().mockResolvedValue(1),
      invalidateActiveForUser: vi.fn().mockResolvedValue(undefined),
      ...(over.resetRepo ?? {}),
    },
    refreshRepo: {
      create: vi.fn().mockResolvedValue({}),
      findByHash: vi.fn().mockResolvedValue(null),
      revoke: vi.fn().mockResolvedValue(undefined),
      revokeAllForUser: vi.fn().mockResolvedValue(undefined),
      ...(over.refreshRepo ?? {}),
    },
    user,
  };
};

const makeService = (repos: ReturnType<typeof makeRepos>) =>
  new AuthService(repos.userRepo as any, repos.resetRepo as any, repos.refreshRepo as any);

beforeEach(() => {
  sentMails.length = 0;
  setMailer({
    send: async (message) => {
      sentMails.push(message);
    },
  });
});

afterEach(() => {
  setMailer(null);
  vi.useRealTimers();
});

describe("otp utilities", () => {
  it("always produces a six digit code, including small numbers", () => {
    for (let i = 0; i < 200; i++) {
      expect(generateOtpCode()).toMatch(/^\d{6}$/);
    }
  });

  it("compares equal strings without leaking length mismatches", () => {
    expect(safeCompare("123456", "123456")).toBe(true);
    expect(safeCompare("123456", "123457")).toBe(false);
    expect(safeCompare("123456", "1234")).toBe(false);
  });
});

describe("AuthService.login", () => {
  it("issues an access token and stores only the hash of the refresh token", async () => {
    const repos = makeRepos();
    const result = await makeService(repos).login({
      userName: "quy",
      password: PASSWORD,
    });

    expect(result.token).toBeTruthy();
    expect(result.refreshToken).toHaveLength(96);
    expect(result.user).not.toHaveProperty("password");

    const stored = repos.refreshRepo.create.mock.calls[0][0];
    expect(stored.tokenHash).toBe(hashRefreshToken(result.refreshToken));
    expect(stored.tokenHash).not.toBe(result.refreshToken);
  });

  it("rejects a wrong password", async () => {
    await expect(
      makeService(makeRepos()).login({ userName: "quy", password: "wrong-password" })
    ).rejects.toMatchObject({ code: ErrorCodes.INCORRECT_PASSWORD });
  });

  it("rejects an unknown account", async () => {
    const repos = makeRepos({ userRepo: { findByUserNameOrEmail: vi.fn().mockResolvedValue(null) } });

    await expect(
      makeService(repos).login({ userName: "ghost", password: PASSWORD })
    ).rejects.toMatchObject({ code: ErrorCodes.USER_NAME_NOT_EXIST });
  });
});

describe("AuthService.refresh", () => {
  it("rotates the presented token", async () => {
    const repos = makeRepos({
      refreshRepo: {
        findByHash: vi.fn().mockResolvedValue({
          id: "rt-1",
          userId: "11111111-1111-4111-8111-111111111111",
          revokedAt: null,
          expiresAt: new Date(Date.now() + 60_000),
        }),
      },
    });

    const result = await makeService(repos).refresh("whatever");

    expect(repos.refreshRepo.revoke).toHaveBeenCalledWith("rt-1");
    expect(repos.refreshRepo.create).toHaveBeenCalledOnce();
    expect(result.token).toBeTruthy();
  });

  it("refuses an expired token", async () => {
    const repos = makeRepos({
      refreshRepo: {
        findByHash: vi.fn().mockResolvedValue({
          id: "rt-1",
          userId: "u",
          revokedAt: null,
          expiresAt: new Date(Date.now() - 1000),
        }),
      },
    });

    await expect(makeService(repos).refresh("x")).rejects.toMatchObject({
      statusCode: 401,
      code: ErrorCodes.REFRESH_TOKEN_INVALID,
    });
  });

  it("refuses an already rotated token", async () => {
    const repos = makeRepos({
      refreshRepo: {
        findByHash: vi.fn().mockResolvedValue({
          id: "rt-1",
          userId: "u",
          revokedAt: new Date(),
          expiresAt: new Date(Date.now() + 60_000),
        }),
      },
    });

    await expect(makeService(repos).refresh("x")).rejects.toMatchObject({
      code: ErrorCodes.REFRESH_TOKEN_INVALID,
    });
  });

  it("refuses a token that was never issued", async () => {
    await expect(makeService(makeRepos()).refresh("made-up")).rejects.toMatchObject({
      code: ErrorCodes.REFRESH_TOKEN_INVALID,
    });
  });
});

describe("AuthService.forgotPassword", () => {
  it("emails a six digit code and retires any earlier ones", async () => {
    const repos = makeRepos();

    await makeService(repos).forgotPassword({ email: "quy@example.com" });

    expect(repos.resetRepo.invalidateActiveForUser).toHaveBeenCalledBefore(
      repos.resetRepo.create as any
    );
    expect(sentMails).toHaveLength(1);
    expect(sentMails[0].to).toBe("quy@example.com");

    const { otpCode } = repos.resetRepo.create.mock.calls[0][0];
    expect(otpCode).toMatch(/^\d{6}$/);
    expect(sentMails[0].text).toContain(otpCode);
  });

  it("rejects an unknown email", async () => {
    const repos = makeRepos({ userRepo: { findByEmail: vi.fn().mockResolvedValue(null) } });

    await expect(
      makeService(repos).forgotPassword({ email: "nobody@example.com" })
    ).rejects.toMatchObject({ code: ErrorCodes.EMAIL_NOT_EXIST });
    expect(sentMails).toHaveLength(0);
  });
});

describe("AuthService.verifyOtp", () => {
  const activeRecord = (over: Record<string, any> = {}) => ({
    id: "pr-1",
    otpCode: "123456",
    otpExpiresAt: new Date(Date.now() + 60_000),
    isUsed: false,
    isVerified: false,
    attemptCount: 0,
    ...over,
  });

  it("returns a reset token for the right code", async () => {
    const repos = makeRepos({
      resetRepo: { findLatestByUserId: vi.fn().mockResolvedValue(activeRecord()) },
    });

    const result = await makeService(repos).verifyOtp({
      email: "quy@example.com",
      otpCode: "123456",
    });

    expect(result.resetToken).toHaveLength(64);
    expect(repos.resetRepo.markVerified).toHaveBeenCalledOnce();
  });

  it("counts a wrong code as an attempt", async () => {
    const repos = makeRepos({
      resetRepo: { findLatestByUserId: vi.fn().mockResolvedValue(activeRecord()) },
    });

    await expect(
      makeService(repos).verifyOtp({ email: "quy@example.com", otpCode: "999999" })
    ).rejects.toMatchObject({ code: ErrorCodes.OTP_INCORRECT });
    expect(repos.resetRepo.incrementAttempt).toHaveBeenCalledWith("pr-1");
  });

  it("burns the code once the attempt limit is reached", async () => {
    const repos = makeRepos({
      resetRepo: {
        findLatestByUserId: vi.fn().mockResolvedValue(activeRecord({ attemptCount: 4 })),
        incrementAttempt: vi.fn().mockResolvedValue(5),
      },
    });

    await expect(
      makeService(repos).verifyOtp({ email: "quy@example.com", otpCode: "999999" })
    ).rejects.toMatchObject({ statusCode: 429, code: ErrorCodes.OTP_TOO_MANY_ATTEMPTS });
    expect(repos.resetRepo.markUsed).toHaveBeenCalledWith("pr-1");
  });

  it("refuses a locked record even when the code is right", async () => {
    const repos = makeRepos({
      resetRepo: {
        findLatestByUserId: vi.fn().mockResolvedValue(activeRecord({ attemptCount: 5 })),
      },
    });

    await expect(
      makeService(repos).verifyOtp({ email: "quy@example.com", otpCode: "123456" })
    ).rejects.toMatchObject({ code: ErrorCodes.OTP_TOO_MANY_ATTEMPTS });
  });

  it("refuses an expired code", async () => {
    const repos = makeRepos({
      resetRepo: {
        findLatestByUserId: vi
          .fn()
          .mockResolvedValue(activeRecord({ otpExpiresAt: new Date(Date.now() - 1000) })),
      },
    });

    await expect(
      makeService(repos).verifyOtp({ email: "quy@example.com", otpCode: "123456" })
    ).rejects.toMatchObject({ code: ErrorCodes.OTP_EXPIRED });
  });
});

describe("AuthService.resetPassword", () => {
  const verifiedRecord = (over: Record<string, any> = {}) => ({
    id: "pr-1",
    userId: "11111111-1111-4111-8111-111111111111",
    isUsed: false,
    isVerified: true,
    tokenExpiresAt: new Date(Date.now() + 60_000),
    ...over,
  });

  it("stores a hash, consumes the token and ends every session", async () => {
    const repos = makeRepos({
      resetRepo: { findByResetToken: vi.fn().mockResolvedValue(verifiedRecord()) },
    });

    await makeService(repos).resetPassword({
      resetToken: "t",
      newPassword: "a-new-password",
    });

    const { password } = repos.userRepo.update.mock.calls[0][1];
    expect(password).not.toBe("a-new-password");
    expect(await bcrypt.compare("a-new-password", password)).toBe(true);
    expect(repos.resetRepo.markUsed).toHaveBeenCalledWith("pr-1");
    expect(repos.refreshRepo.revokeAllForUser).toHaveBeenCalledOnce();
  });

  it("refuses a token whose OTP was never verified", async () => {
    const repos = makeRepos({
      resetRepo: {
        findByResetToken: vi.fn().mockResolvedValue(verifiedRecord({ isVerified: false })),
      },
    });

    await expect(
      makeService(repos).resetPassword({ resetToken: "t", newPassword: "a-new-password" })
    ).rejects.toMatchObject({ code: ErrorCodes.OTP_NOT_VERIFIED });
  });

  it("refuses a reused token", async () => {
    const repos = makeRepos({
      resetRepo: { findByResetToken: vi.fn().mockResolvedValue(verifiedRecord({ isUsed: true })) },
    });

    await expect(
      makeService(repos).resetPassword({ resetToken: "t", newPassword: "a-new-password" })
    ).rejects.toMatchObject({ code: ErrorCodes.RESET_TOKEN_USED });
  });
});

describe("AuthService.changePassword", () => {
  it("revokes other sessions after a successful change", async () => {
    const repos = makeRepos();

    await makeService(repos).changePassword("11111111-1111-4111-8111-111111111111", {
      oldPassword: PASSWORD,
      newPassword: "another-password",
    });

    expect(repos.refreshRepo.revokeAllForUser).toHaveBeenCalledOnce();
  });

  it("rejects a wrong current password", async () => {
    await expect(
      makeService(makeRepos()).changePassword("u", {
        oldPassword: "nope",
        newPassword: "another-password",
      })
    ).rejects.toMatchObject({ code: ErrorCodes.PASSWORD_MISMATCH });
  });
});
