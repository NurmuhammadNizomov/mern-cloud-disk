import nodemailer from 'nodemailer';
import { logger } from '../config/logger';

export class EmailService {
  private static getTransporter() {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER || '',
        pass: (process.env.SMTP_PASS || '').replace(/\s+/g, '')
      }
    });
  }

  static isConfigured(): boolean {
    return Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);
  }

  static generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  static async sendVerificationEmail(email: string, code: string, name: string): Promise<boolean> {
    if (!this.isConfigured()) {
      logger.info(`[Email Service - Dev Mode] Email tasdiqlash kodi (${email}): ${code}`);
      return true;
    }

    try {
      const transporter = this.getTransporter();
      await transporter.sendMail({
        from: `"Safar Disk" <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'Safar Disk: Emailingizni tasdiqlash kodi',
        html: `
          <div style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 14px; background: #ffffff;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h2 style="color: #2563eb; margin: 0; font-size: 24px;">Safar Disk</h2>
              <p style="color: #64748b; font-size: 13px; margin-top: 4px;">Bulutli Xotira Xizmati</p>
            </div>
            <p style="font-size: 15px; color: #1e293b;">Assalomu alaykum, <b>${name}</b>!</p>
            <p style="font-size: 14px; color: #475569; line-height: 1.5;">
              Safar Disk platformasida ro'yxatdan o'tganingiz uchun rahmat. Hisobingizni faollashtirish uchun quyidagi 6 xonali tasdiqlash kodini kiriting:
            </p>
            <div style="background: #f1f5f9; padding: 18px; text-align: center; border-radius: 10px; font-size: 32px; font-weight: 700; letter-spacing: 6px; color: #2563eb; margin: 25px 0;">
              ${code}
            </div>
            <p style="color: #64748b; font-size: 12px; line-height: 1.4; border-top: 1px solid #f1f5f9; padding-top: 15px;">
              Ushbu kod 15 daqiqa davomida amal qiladi. Agar siz ro'yxatdan o'tishni so'ramagan bo'lsangiz, xatga e'tibor bermang.
            </p>
          </div>
        `
      });
      logger.info(`[Email Service] Tasdiqlash kodi ${email} ga muvaffaqiyatli yuborildi`);
      return true;
    } catch (error) {
      logger.error(`[Email Service Error] Email yuborishda xatolik (${email}):`, error);
      return false;
    }
  }

  static async sendResetPasswordEmail(email: string, code: string): Promise<boolean> {
    if (!this.isConfigured()) {
      logger.info(`[Email Service - Dev Mode] Parolni tiklash kodi (${email}): ${code}`);
      return true;
    }

    try {
      const transporter = this.getTransporter();
      await transporter.sendMail({
        from: `"Safar Disk" <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'Safar Disk: Parolni tiklash tasdiq kodi',
        html: `
          <div style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 14px; background: #ffffff;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h2 style="color: #2563eb; margin: 0; font-size: 24px;">Safar Disk</h2>
            </div>
            <p style="font-size: 14px; color: #475569;">Parolingizni tiklash bo'yicha so'rov yuborildi. Tasdiqlash kodi:</p>
            <div style="background: #fef2f2; padding: 18px; text-align: center; border-radius: 10px; font-size: 32px; font-weight: 700; letter-spacing: 6px; color: #dc2626; margin: 25px 0;">
              ${code}
            </div>
            <p style="color: #64748b; font-size: 12px;">Ushbu kod 15 daqiqa davomida amal qiladi.</p>
          </div>
        `
      });
      logger.info(`[Email Service] Reset kodi ${email} ga muvaffaqiyatli yuborildi`);
      return true;
    } catch (error) {
      logger.error(`[Email Service Error] Reset email yuborishda xatolik (${email}):`, error);
      return false;
    }
  }
}
