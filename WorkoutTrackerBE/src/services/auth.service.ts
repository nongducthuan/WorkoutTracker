import bcrypt from "bcrypt";
import { UserRepository } from "../repositories/user.repository";
import { generateToken } from "../utils/jwt.util";
import { AppError } from "../errors/appError";
import {
  LoginDto,
  RegisterDto,
  ChangePasswordDto,
  UpdateProfileDto,
} from "../dtos/auth.dto";

export class AuthService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async login(dto: LoginDto): Promise<{ token: string }> {
    const user = await this.userRepository.findByUserNameOrEmail(dto.userName);
    if (!user) {
      throw new AppError("UserNameNotExist", 400);
    }

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) {
      throw new AppError("IncorrectPassword", 400);
    }

    const token = generateToken(user);
    return { token };
  }

  async register(dto: RegisterDto): Promise<{ token: string }> {
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
    return { token };
  }

  async changePassword(userId: string, dto: ChangePasswordDto): Promise<{ message: string }> {
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

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<{ token: string }> {
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
    return { token };
  }
}
