import bcrypt from 'bcryptjs';
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
      throw new AppError('Ushbu email bilan foydalanuvchi allaqachon ro\'yxatdan o\'tgan', StatusCodes.CONFLICT);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const verificationCode = EmailService.generateCode();
    const verificationCodeExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

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
      throw new AppError('Foydalanuvchi topilmadi', StatusCodes.NOT_FOUND);
    }

    if (user.isEmailVerified) {
      return { message: 'Email allaqachon tasdiqlangan', isEmailVerified: true };
    }

    if (!user.verificationCode || user.verificationCode !== code.trim()) {
      throw new AppError('Tasdiqlash kodi noto\'g\'ri', StatusCodes.BAD_REQUEST);
    }

    if (user.verificationCodeExpires && user.verificationCodeExpires < new Date()) {
      throw new AppError('Tasdiqlash kodining muddati o\'tgan. Yangi kod so\'rang', StatusCodes.BAD_REQUEST);
    }

    user.isEmailVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    await user.save();

    return { message: 'Email muvaffaqiyatli tasdiqlandi', isEmailVerified: true };
  }

  static async resendVerificationCode(email: string) {
    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      throw new AppError('Foydalanuvchi topilmadi', StatusCodes.NOT_FOUND);
    }

    if (user.isEmailVerified) {
      throw new AppError('Email allaqachon tasdiqlangan', StatusCodes.BAD_REQUEST);
    }

    const code = EmailService.generateCode();
    user.verificationCode = code;
    user.verificationCodeExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    await EmailService.sendVerificationEmail(user.email, code, user.name);
    return { message: 'Yangi tasdiqlash kodi yuborildi' };
  }

  static async login(email: string, password: string) {
    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      throw new AppError('Email yoki parol noto\'g\'ri', StatusCodes.UNAUTHORIZED);
    }

    const isMatch = await bcrypt.compare(password, user.password || '');
    if (!isMatch) {
      throw new AppError('Email yoki parol noto\'g\'ri', StatusCodes.UNAUTHORIZED);
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
      throw new AppError('Refresh token ko\'rsatilmadi', StatusCodes.BAD_REQUEST);
    }

    let payload;
    try {
      payload = verifyRefreshToken(token);
    } catch {
      throw new AppError('Yaroqsiz yoki muddati o\'tgan refresh token', StatusCodes.UNAUTHORIZED);
    }

    const user = await User.findById(payload.id);
    if (!user || !user.refreshTokens.includes(token)) {
      throw new AppError('Refresh token bazada topilmadi yoki bekor qilingan', StatusCodes.UNAUTHORIZED);
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
      return { message: 'Agar ushbu email ro\'yxatdan o\'tgan bo\'lsa, tasdiq kodi yuborildi' };
    }

    const code = EmailService.generateCode();
    user.resetPasswordCode = code;
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    await EmailService.sendResetPasswordEmail(user.email, code);
    return { message: 'Parolni tiklash kodi emailingizga yuborildi' };
  }

  static async resetPassword(email: string, code: string, newPassword: string) {
    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail });
    if (!user || !user.resetPasswordCode || user.resetPasswordCode !== code.trim()) {
      throw new AppError('Noto\'g\'ri tasdiqlash kodi', StatusCodes.BAD_REQUEST);
    }

    if (user.resetPasswordExpires && user.resetPasswordExpires < new Date()) {
      throw new AppError('Tasdiqlash kodining muddati o\'tgan', StatusCodes.BAD_REQUEST);
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetPasswordCode = undefined;
    user.resetPasswordExpires = undefined;
    user.refreshTokens = []; // Log out from all devices
    await user.save();

    return { message: 'Parol muvaffaqiyatli yangilandi. Yangi parol bilan tizimga kiring' };
  }

  static async getProfile(userId: string) {
    const user = await User.findById(userId).select('-password');
    if (!user) {
      throw new AppError('Foydalanuvchi topilmadi', StatusCodes.NOT_FOUND);
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
