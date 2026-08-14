import bcrypt from "bcrypt";
import { User } from "@prisma/client";
import { UserRepository } from "../repositories/user.repository";
import { PasswordResetRepository } from "../repositories/passwordReset.repository";
import { RefreshTokenRepository } from "../repositories/refreshToken.repository";
import { generateToken } from "../utils/jwt.util";
import { generateOtpCode, generateResetToken, safeCompare } from "../utils/otp.util";
import { generateRefreshToken, hashRefreshToken } from "../utils/refreshToken.util";
import { getMailer, buildOtpMail } from "./mail.service";
import { AppError, ErrorCodes } from "../errors/appError";
import { config } from "../config/env";
import { logger } from "../config/logger";
import {
  LoginDto,
  RegisterDto,
  ChangePasswordDto,
  UpdateProfileDto,
  ForgotPasswordDto,
  VerifyOtpDto,
  ResetPasswordDto,
} from "../dtos/auth.dto";

const BCRYPT_ROUNDS = 10;

export interface PublicUser {
  id: string;
  fullName: string;
  email: string;
  userName: string;
  avatarUrl: string | null;
  weightKg: number | null;
  heightCm: number | null;
  /** `YYYY-MM-DD`, or null — a date of birth has no meaningful time component. */
  birthday: string | null;
}

export interface AuthResult {
  token: string;
  refreshToken: string;
  expiresIn: string;
  user: PublicUser;
}

export const toPublicUser = (user: User): PublicUser => ({
  id: user.id,
  fullName: user.fullName,
  email: user.email,
  userName: user.userName,
  avatarUrl: user.avatarUrl,
  weightKg: user.weightKg,
  heightCm: user.heightCm,
  birthday: user.birthday ? user.birthday.toISOString().slice(0, 10) : null,
});

export class AuthService {
  private userRepository: UserRepository;
  private passwordResetRepository: PasswordResetRepository;
  private refreshTokenRepository: RefreshTokenRepository;

  constructor(
    userRepository: UserRepository = new UserRepository(),
    passwordResetRepository: PasswordResetRepository = new PasswordResetRepository(),
    refreshTokenRepository: RefreshTokenRepository = new RefreshTokenRepository()
  ) {
    this.userRepository = userRepository;
    this.passwordResetRepository = passwordResetRepository;
    this.refreshTokenRepository = refreshTokenRepository;
  }

  private async issueTokens(user: User): Promise<AuthResult> {
    const refreshToken = generateRefreshToken();
    const expiresAt = new Date(
      Date.now() + config.refreshTokenDays * 24 * 60 * 60 * 1000
    );

    await this.refreshTokenRepository.create({
      userId: user.id,
      tokenHash: hashRefreshToken(refreshToken),
      expiresAt,
    });

    return {
      token: generateToken(user),
      refreshToken,
      expiresIn: config.jwtExpiresIn,
      user: toPublicUser(user),
    };
  }

  async login(dto: LoginDto): Promise<AuthResult> {
    const user = await this.userRepository.findByUserNameOrEmail(dto.userName);
    if (!user) {
      throw new AppError("UserNameNotExist", 400, ErrorCodes.USER_NAME_NOT_EXIST);
    }

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) {
      throw new AppError("IncorrectPassword", 400, ErrorCodes.INCORRECT_PASSWORD);
    }

    return this.issueTokens(user);
  }

  async register(dto: RegisterDto): Promise<AuthResult> {
    const existingUserName = await this.userRepository.findByUserName(dto.userName);
    if (existingUserName) {
      throw new AppError("UserNameAlreadyExits", 400, ErrorCodes.USER_NAME_TAKEN);
    }

    const existingEmail = await this.userRepository.findByEmail(dto.email);
    if (existingEmail) {
      throw new AppError("EmailAlreadyExists", 400, ErrorCodes.EMAIL_TAKEN);
    }

    const newUser = await this.userRepository.create({
      fullName: dto.fullName,
      userName: dto.userName,
      email: dto.email,
      password: await bcrypt.hash(dto.password, BCRYPT_ROUNDS),
    });

    return this.issueTokens(newUser);
  }

  async me(userId: string): Promise<PublicUser> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppError("UserNotFound", 404, ErrorCodes.USER_NOT_FOUND);
    }
    return toPublicUser(user);
  }

  async refresh(rawToken: string): Promise<AuthResult> {
    const record = await this.refreshTokenRepository.findByHash(
      hashRefreshToken(rawToken)
    );

    if (!record || record.revokedAt || record.expiresAt < new Date()) {
      throw new AppError("RefreshTokenInvalid", 401, ErrorCodes.REFRESH_TOKEN_INVALID);
    }

    const user = await this.userRepository.findById(record.userId);
    if (!user) {
      throw new AppError("UserNotFound", 404, ErrorCodes.USER_NOT_FOUND);
    }

    // Rotate: the presented token is burned and a fresh one issued, so a stolen
    // refresh token is usable at most once before the real client invalidates it.
    await this.refreshTokenRepository.revoke(record.id);
    return this.issueTokens(user);
  }

  async logout(rawToken?: string, userId?: string): Promise<{ message: string }> {
    if (rawToken) {
      const record = await this.refreshTokenRepository.findByHash(
        hashRefreshToken(rawToken)
      );
      // Logging out with an unknown token is not an error worth surfacing: the
      // desired end state (that token cannot be used) already holds.
      if (record && !record.revokedAt) {
        await this.refreshTokenRepository.revoke(record.id);
      }
    } else if (userId) {
      await this.refreshTokenRepository.revokeAllForUser(userId);
    }

    return { message: "Logged out successfully" };
  }

  async changePassword(
    userId: string,
    dto: ChangePasswordDto
  ): Promise<{ message: string }> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppError("UserNotFound", 404, ErrorCodes.USER_NOT_FOUND);
    }

    const isMatch = await bcrypt.compare(dto.oldPassword, user.password);
    if (!isMatch) {
      throw new AppError("PasswordMismatch", 400, ErrorCodes.PASSWORD_MISMATCH);
    }

    await this.userRepository.update(userId, {
      password: await bcrypt.hash(dto.newPassword, BCRYPT_ROUNDS),
    });

    // Changing a password should end every other session.
    await this.refreshTokenRepository.revokeAllForUser(userId);

    return { message: "Password updated successfully" };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<AuthResult> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppError("UserNotFound", 404, ErrorCodes.USER_NOT_FOUND);
    }

    const existingEmail = await this.userRepository.findByEmailExcludingUser(
      dto.email,
      userId
    );
    if (existingEmail) {
      throw new AppError("EmailAlreadyExists", 400, ErrorCodes.EMAIL_TAKEN);
    }

    const updatedUser = await this.userRepository.update(userId, {
      fullName: dto.fullName,
      email: dto.email,
      // `undefined` leaves the column alone; an explicit `null` clears it.
      ...(dto.avatarUrl !== undefined ? { avatarUrl: dto.avatarUrl } : {}),
      ...(dto.weightKg !== undefined ? { weightKg: dto.weightKg } : {}),
      ...(dto.heightCm !== undefined ? { heightCm: dto.heightCm } : {}),
      ...(dto.birthday !== undefined
        ? { birthday: dto.birthday ? new Date(`${dto.birthday}T00:00:00.000Z`) : null }
        : {}),
    });

    // The JWT carries the display name and email, so it has to be reissued.
    return this.issueTokens(updatedUser);
  }

  async forgotPassword(dto: ForgotPasswordDto): Promise<{ message: string }> {
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) {
      throw new AppError("EmailNotExist", 400, ErrorCodes.EMAIL_NOT_EXIST);
    }

    await this.passwordResetRepository.invalidateActiveForUser(user.id);

    const otpCode = generateOtpCode();
    const otpExpiresAt = new Date(Date.now() + config.otp.ttlMinutes * 60 * 1000);

    await this.passwordResetRepository.create({
      userId: user.id,
      otpCode,
      otpExpiresAt,
    });

    await getMailer().send(
      buildOtpMail(user.email, user.fullName, otpCode, config.otp.ttlMinutes)
    );

    return { message: "OTP has been sent to your email" };
  }

  async verifyOtp(dto: VerifyOtpDto): Promise<{ resetToken: string }> {
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) {
      throw new AppError("EmailNotExist", 400, ErrorCodes.EMAIL_NOT_EXIST);
    }

    const record = await this.passwordResetRepository.findLatestByUserId(user.id);
    if (!record) {
      throw new AppError("OtpNotFound", 400, ErrorCodes.OTP_NOT_FOUND);
    }
    if (record.isUsed) {
      throw new AppError("OtpAlreadyUsed", 400, ErrorCodes.OTP_ALREADY_USED);
    }
    if (record.attemptCount >= config.otp.maxAttempts) {
      throw new AppError("OtpTooManyAttempts", 429, ErrorCodes.OTP_TOO_MANY_ATTEMPTS);
    }
    if (record.otpExpiresAt < new Date()) {
      throw new AppError("OtpExpired", 400, ErrorCodes.OTP_EXPIRED);
    }

    if (!safeCompare(record.otpCode, dto.otpCode)) {
      const attempts = await this.passwordResetRepository.incrementAttempt(record.id);
      if (attempts >= config.otp.maxAttempts) {
        // Burn the code outright: at this point it is being guessed, not mistyped.
        await this.passwordResetRepository.markUsed(record.id);
        logger.warn({ userId: user.id }, "OTP locked after too many wrong attempts");
        throw new AppError("OtpTooManyAttempts", 429, ErrorCodes.OTP_TOO_MANY_ATTEMPTS);
      }
      throw new AppError("OtpIncorrect", 400, ErrorCodes.OTP_INCORRECT);
    }

    const resetToken = generateResetToken();
    const tokenExpiresAt = new Date(
      Date.now() + config.otp.resetTokenTtlMinutes * 60 * 1000
    );

    await this.passwordResetRepository.markVerified(record.id, resetToken, tokenExpiresAt);

    return { resetToken };
  }

  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    const record = await this.passwordResetRepository.findByResetToken(dto.resetToken);
    if (!record) {
      throw new AppError("ResetTokenInvalid", 400, ErrorCodes.RESET_TOKEN_INVALID);
    }
    if (record.isUsed) {
      throw new AppError("ResetTokenAlreadyUsed", 400, ErrorCodes.RESET_TOKEN_USED);
    }
    if (!record.isVerified) {
      throw new AppError("OtpNotVerified", 400, ErrorCodes.OTP_NOT_VERIFIED);
    }
    if (!record.tokenExpiresAt || record.tokenExpiresAt < new Date()) {
      throw new AppError("ResetTokenExpired", 400, ErrorCodes.RESET_TOKEN_EXPIRED);
    }

    await this.userRepository.update(record.userId, {
      password: await bcrypt.hash(dto.newPassword, BCRYPT_ROUNDS),
    });
    await this.passwordResetRepository.markUsed(record.id);
    await this.refreshTokenRepository.revokeAllForUser(record.userId);

    return { message: "Password has been reset successfully" };
  }
}
