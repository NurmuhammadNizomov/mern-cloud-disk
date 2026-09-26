import bcrypt from 'bcryptjs';
import dayjs from 'dayjs';
import { StatusCodes } from 'http-status-codes';
import { User, IUser } from '../models/User';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken
} from '../utils/tokenHelper';
import { EmailService } from './emailService';
import { AppError } from '../middleware/errorHandler';

export class AuthService {
  static async register(name: string, email: string, password: string) {
    const cleanEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      throw new AppError('An account with this email already exists', StatusCodes.CONFLICT);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const verificationCode = EmailService.generateCode();
    const verificationCodeExpires = dayjs().add(15, 'minute').toDate();

    const newUser = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password: hashedPassword,
      storageUsed: 0,
      storageLimit: 15 * 1024 * 1024 * 1024,
      isEmailVerified: false,
      verificationCode,
      verificationCodeExpires,
      refreshTokens: []
    });

    const accessToken = generateAccessToken(newUser._id.toString(), newUser.email);
    const refreshToken = generateRefreshToken(newUser._id.toString(), newUser.email);

    newUser.refreshTokens.push(refreshToken);
    await newUser.save();

    // Send verification email or log to console
    await EmailService.sendVerificationEmail(newUser.email, verificationCode, newUser.name);

    return {
      accessToken,
      refreshToken,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        isEmailVerified: newUser.isEmailVerified,
        storageUsed: newUser.storageUsed,
        storageLimit: newUser.storageLimit
      },
      verificationRequired: true
    };
  }

  static async verifyEmail(email: string, code: string) {
    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      throw new AppError('User not found', StatusCodes.NOT_FOUND);
    }

    if (user.isEmailVerified) {
      return { message: 'Email is already verified', isEmailVerified: true };
    }

    if (!user.verificationCode || user.verificationCode !== code.trim()) {
      throw new AppError('Invalid verification code', StatusCodes.BAD_REQUEST);
    }

    if (user.verificationCodeExpires && dayjs().isAfter(dayjs(user.verificationCodeExpires))) {
      throw new AppError('Verification code has expired. Please request a new code', StatusCodes.BAD_REQUEST);
    }

    user.isEmailVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    await user.save();

    return { message: 'Email verified successfully', isEmailVerified: true };
  }

  static async resendVerificationCode(email: string) {
    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      throw new AppError('User not found', StatusCodes.NOT_FOUND);
    }

    if (user.isEmailVerified) {
      throw new AppError('Email is already verified', StatusCodes.BAD_REQUEST);
    }

    const code = EmailService.generateCode();
    user.verificationCode = code;
    user.verificationCodeExpires = dayjs().add(15, 'minute').toDate();
    await user.save();

    await EmailService.sendVerificationEmail(user.email, code, user.name);
    return { message: 'A new verification code has been sent' };
  }

  static async login(email: string, password: string) {
    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      throw new AppError('Invalid email or password', StatusCodes.UNAUTHORIZED);
    }

    const isMatch = await bcrypt.compare(password, user.password || '');
    if (!isMatch) {
      throw new AppError('Invalid email or password', StatusCodes.UNAUTHORIZED);
    }

    const accessToken = generateAccessToken(user._id.toString(), user.email);
    const refreshToken = generateRefreshToken(user._id.toString(), user.email);

    // Limit active refresh tokens to 5 devices
    if (!user.refreshTokens) user.refreshTokens = [];
    user.refreshTokens = user.refreshTokens.slice(-4);
    user.refreshTokens.push(refreshToken);
    await user.save();

    return {
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
        storageUsed: user.storageUsed,
        storageLimit: user.storageLimit
      }
    };
  }

  static async refreshTokens(token: string) {
    if (!token) {
      throw new AppError('Refresh token is required', StatusCodes.BAD_REQUEST);
    }

    let payload;
    try {
      payload = verifyRefreshToken(token);
    } catch {
      throw new AppError('Invalid or expired refresh token', StatusCodes.UNAUTHORIZED);
    }

    const user = await User.findById(payload.id);
    if (!user || !user.refreshTokens.includes(token)) {
      throw new AppError('Refresh token not found or revoked', StatusCodes.UNAUTHORIZED);
    }

    // Token rotation: remove old token and add new token
    const newAccessToken = generateAccessToken(user._id.toString(), user.email);
    const newRefreshToken = generateRefreshToken(user._id.toString(), user.email);

    user.refreshTokens = user.refreshTokens.filter((t) => t !== token);
    user.refreshTokens.push(newRefreshToken);
    await user.save();

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    };
  }

  static async logout(userId: string, refreshToken?: string) {
    if (refreshToken) {
      await User.findByIdAndUpdate(userId, {
        $pull: { refreshTokens: refreshToken }
      });
    }
    return true;
  }

  static async forgotPassword(email: string) {
    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      // Don't disclose user existence for security
      return { message: 'If an account exists with this email, a reset code has been sent' };
    }

    const code = EmailService.generateCode();
    user.resetPasswordCode = code;
    user.resetPasswordExpires = dayjs().add(15, 'minute').toDate();
    await user.save();

    await EmailService.sendResetPasswordEmail(user.email, code);
    return { message: 'Password reset code has been sent to your email' };
  }

  static async resetPassword(email: string, code: string, newPassword: string) {
    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail });
    if (!user || !user.resetPasswordCode || user.resetPasswordCode !== code.trim()) {
      throw new AppError('Invalid verification code', StatusCodes.BAD_REQUEST);
    }

    if (user.resetPasswordExpires && dayjs().isAfter(dayjs(user.resetPasswordExpires))) {
      throw new AppError('Verification code has expired', StatusCodes.BAD_REQUEST);
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetPasswordCode = undefined;
    user.resetPasswordExpires = undefined;
    user.refreshTokens = []; // Log out from all devices
    await user.save();

    return { message: 'Password updated successfully. Please log in with your new password' };
  }

  static async getProfile(userId: string) {
    const user = await User.findById(userId).select('-password');
    if (!user) {
      throw new AppError('User not found', StatusCodes.NOT_FOUND);
    }
    return {
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      isEmailVerified: user.isEmailVerified,
      storageUsed: user.storageUsed,
      storageLimit: user.storageLimit
    };
  }
}
