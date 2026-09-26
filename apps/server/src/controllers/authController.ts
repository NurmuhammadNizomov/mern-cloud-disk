import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { AuthService } from '../services/authService';
import { AuthRequest } from '../middleware/auth';
import { sendSuccess } from '../utils/responseHelper';

export const register = async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, email, password } = req.body;
  const result = await AuthService.register(name, email, password);
  sendSuccess(res, StatusCodes.CREATED, 'Registration successful. Verification code sent to email', result);
};

export const verifyEmail = async (req: AuthRequest, res: Response): Promise<void> => {
  const { email, code } = req.body;
  const result = await AuthService.verifyEmail(email, code);
  sendSuccess(res, StatusCodes.OK, result.message, result);
};

export const resendVerification = async (req: AuthRequest, res: Response): Promise<void> => {
  const { email } = req.body;
  const result = await AuthService.resendVerificationCode(email);
  sendSuccess(res, StatusCodes.OK, result.message);
};

export const login = async (req: AuthRequest, res: Response): Promise<void> => {
  const { email, password } = req.body;
  const result = await AuthService.login(email, password);
  sendSuccess(res, StatusCodes.OK, 'Login successful', result);
};

export const refreshToken = async (req: AuthRequest, res: Response): Promise<void> => {
  const { refreshToken: token } = req.body;
  const result = await AuthService.refreshTokens(token);
  sendSuccess(res, StatusCodes.OK, 'Token refreshed successfully', result);
};

export const logout = async (req: AuthRequest, res: Response): Promise<void> => {
  const { refreshToken: token } = req.body;
  await AuthService.logout(req.user!.id, token);
  sendSuccess(res, StatusCodes.OK, 'Logged out successfully');
};

export const forgotPassword = async (req: AuthRequest, res: Response): Promise<void> => {
  const { email } = req.body;
  const result = await AuthService.forgotPassword(email);
  sendSuccess(res, StatusCodes.OK, result.message);
};

export const resetPassword = async (req: AuthRequest, res: Response): Promise<void> => {
  const { email, code, newPassword } = req.body;
  const result = await AuthService.resetPassword(email, code, newPassword);
  sendSuccess(res, StatusCodes.OK, result.message);
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  const profile = await AuthService.getProfile(req.user!.id);
  sendSuccess(res, StatusCodes.OK, 'User profile retrieved successfully', { user: profile });
};
