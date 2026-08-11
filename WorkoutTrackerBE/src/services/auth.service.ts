import bcrypt from "bcrypt";
import { UserRepository } from "../repositories/user.repository";
import { PasswordResetRepository } from "../repositories/passwordReset.repository";
import { generateToken } from "../utils/jwt.util";
import { generateOtpCode, generateResetToken } from "../utils/otp.util";
import { AppError } from "../errors/appError";
import {
  LoginDto,
  RegisterDto,
  ChangePasswordDto,
  UpdateProfileDto,
  ForgotPasswordDto,
  VerifyOtpDto,
  ResetPasswordDto,
} from "../dtos/auth.dto";

export class AuthService {
  private userRepository: UserRepository;
  private passwordResetRepository: PasswordResetRepository;

  constructor() {
    this.userRepository = new UserRepository();
    this.passwordResetRepository = new PasswordResetRepository();
  }

  async login(dto: LoginDto) {
    const user = await this.userRepository.findByUserNameOrEmail(dto.userName);
    if (!user) {
      throw new AppError("UserNameNotExist", 400);
    }

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) {
      throw new AppError("IncorrectPassword", 400);
    }

    const token = generateToken(user);
    return {
      token,
      user: { id: user.id, fullName: user.fullName, email: user.email, userName: user.userName },
    };
  }

  async register(dto: RegisterDto) {
    const existingUserName = await this.userRepository.findByUserName(dto.userName);
    if (existingUserName) {
      throw new AppError("UserNameAlreadyExits", 400);
    }

    const existingEmail = await this.userRepository.findByEmail(dto.email);
    if (existingEmail) {
      throw new AppError("EmailAlreadyExists", 400);
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const newUser = await this.userRepository.create({
      fullName: dto.fullName,
      userName: dto.userName,
      email: dto.email,
      password: hashedPassword,
    });

    const token = generateToken(newUser);
    return {
      token,
      user: { id: newUser.id, fullName: newUser.fullName, email: newUser.email, userName: newUser.userName },
    };
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppError("UserNotFound", 404);
    }

    const isMatch = await bcrypt.compare(dto.oldPassword, user.password);
    if (!isMatch) {
      throw new AppError("PasswordMismatch", 400);
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);
    await this.userRepository.update(userId, { password: hashedPassword });

    return { message: "Password updated successfully" };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppError("UserNotFound", 404);
    }

    const existingEmail = await this.userRepository.findByEmailExcludingUser(dto.email, userId);
    if (existingEmail) {
      throw new AppError("EmailAlreadyExists", 400);
    }

    const updatedUser = await this.userRepository.update(userId, {
      fullName: dto.fullName,
      email: dto.email,
    });

    const token = generateToken(updatedUser);
    return {
      token,
      user: { id: updatedUser.id, fullName: updatedUser.fullName, email: updatedUser.email, userName: updatedUser.userName },
    };
  }

  // ===== Thêm mới cho flow quên mật khẩu =====

  async forgotPassword(dto: ForgotPasswordDto): Promise<{ message: string }> {
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) {
      throw new AppError("EmailNotExist", 400);
    }

    const otpCode = generateOtpCode();
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 phút

    await this.passwordResetRepository.create({
      userId: user.id,
      otpCode,
      otpExpiresAt,
    });

    // TODO: thay đoạn này bằng gọi mail service thật khi có
    console.log(`[OTP] Gửi tới ${user.email}: ${otpCode} (hết hạn lúc ${otpExpiresAt.toISOString()})`);

    return { message: "OTP has been sent to your email" };
  }

  async verifyOtp(dto: VerifyOtpDto): Promise<{ resetToken: string }> {
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) {
      throw new AppError("EmailNotExist", 400);
    }

    const record = await this.passwordResetRepository.findLatestByUserId(user.id);
    if (!record) {
      throw new AppError("OtpNotFound", 400);
    }

    if (record.isUsed) {
      throw new AppError("OtpAlreadyUsed", 400);
    }

    if (record.otpExpiresAt < new Date()) {
      throw new AppError("OtpExpired", 400);
    }

    if (record.otpCode !== dto.otpCode) {
      throw new AppError("OtpIncorrect", 400);
    }

    const resetToken = generateResetToken();
    const tokenExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await this.passwordResetRepository.markVerified(record.id, resetToken, tokenExpiresAt);

    return { resetToken };
  }

  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    const record = await this.passwordResetRepository.findByResetToken(dto.resetToken);
    if (!record) {
      throw new AppError("ResetTokenInvalid", 400);
    }

    if (record.isUsed) {
      throw new AppError("ResetTokenAlreadyUsed", 400);
    }

    if (!record.isVerified) {
      throw new AppError("OtpNotVerified", 400);
    }

    if (!record.tokenExpiresAt || record.tokenExpiresAt < new Date()) {
      throw new AppError("ResetTokenExpired", 400);
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);
    await this.userRepository.update(record.userId, { password: hashedPassword });
    await this.passwordResetRepository.markUsed(record.id);

    return { message: "Password has been reset successfully" };
  }
}