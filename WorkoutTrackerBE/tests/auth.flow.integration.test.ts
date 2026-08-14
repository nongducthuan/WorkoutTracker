import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";

/**
 * End to end pass over the auth flow against a real database.
 *
 * Opt-in: it writes real rows, so it must never run against a developer's
 * working database by accident. CI sets RUN_INTEGRATION_TESTS=true along with a
 * throwaway DATABASE_URL.
 */
const enabled = process.env.RUN_INTEGRATION_TESTS === "true";

describe.skipIf(!enabled)("auth flow (integration)", () => {
  let app: any;
  let prisma: any;
  let mails: { to: string; text: string }[] = [];

  const unique = Date.now();
  const email = `flow-${unique}@example.com`;
  const userName = `flow-${unique}`;
  const password = "initial-password-1";

  beforeAll(async () => {
    const mailService = await import("../src/services/mail.service");
    mailService.setMailer({
      send: async (message) => {
        mails.push({ to: message.to, text: message.text });
      },
    });

    app = (await import("../src/app")).default;
    prisma = (await import("../src/config/prisma")).prisma;
  });

  afterAll(async () => {
    if (prisma) {
      await prisma.user.deleteMany({ where: { email } });
      await prisma.$disconnect();
    }
  });

  it("registers, refreshes, resets the password and signs in again", async () => {
    const registered = await request(app)
      .post("/auth/register")
      .send({ fullName: "Flow Test", userName, email, password })
      .expect(201);

    expect(registered.body.token).toBeTruthy();
    expect(registered.body.refreshToken).toBeTruthy();
    expect(registered.body.user.email).toBe(email);
    expect(registered.body.user).not.toHaveProperty("password");

    // The access token works.
    await request(app)
      .get("/auth/me")
      .set("Authorization", `Bearer ${registered.body.token}`)
      .expect(200);

    // Settings materialise with defaults on first read.
    const settings = await request(app)
      .get("/me/settings")
      .set("Authorization", `Bearer ${registered.body.token}`)
      .expect(200);
    expect(settings.body.weeklyGoal).toBe(4);
    expect(settings.body.preferredDays).toEqual([]);

    // Refresh rotates: the old token must stop working.
    const refreshed = await request(app)
      .post("/auth/refresh")
      .send({ refreshToken: registered.body.refreshToken })
      .expect(200);
    expect(refreshed.body.refreshToken).not.toBe(registered.body.refreshToken);

    await request(app)
      .post("/auth/refresh")
      .send({ refreshToken: registered.body.refreshToken })
      .expect(401);

    // Password reset, end to end.
    mails = [];
    await request(app).post("/auth/forgot-password").send({ email }).expect(200);
    expect(mails).toHaveLength(1);

    const otpCode = mails[0].text.match(/\b(\d{6})\b/)?.[1];
    expect(otpCode).toBeTruthy();

    await request(app)
      .post("/auth/verify-otp")
      .send({ email, otpCode: "000000" === otpCode ? "111111" : "000000" })
      .expect(400);

    const verified = await request(app)
      .post("/auth/verify-otp")
      .send({ email, otpCode })
      .expect(200);

    const newPassword = "rotated-password-2";
    await request(app)
      .put("/auth/reset-password")
      .send({ resetToken: verified.body.resetToken, newPassword })
      .expect(200);

    // The reset token is single use.
    await request(app)
      .put("/auth/reset-password")
      .send({ resetToken: verified.body.resetToken, newPassword })
      .expect(400);

    await request(app)
      .post("/auth/login")
      .send({ userName, password })
      .expect(400);

    await request(app).post("/auth/login").send({ userName, password: newPassword }).expect(200);
  });

  it("rejects unauthenticated access with a stable code", async () => {
    const res = await request(app).get("/workouts").expect(401);
    expect(res.body.code).toBe("JWT_TOKEN_INVALID");
  });

  it("rejects a short password at registration", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({ fullName: "X", userName: `short-${unique}`, email: `short-${unique}@e.com`, password: "abc" })
      .expect(400);
    expect(res.body.code).toBe("INVALID_INPUT");
  });
});
