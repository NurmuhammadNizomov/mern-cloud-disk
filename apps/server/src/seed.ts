import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { User } from './models/User';
import { Folder } from './models/Folder';
import { logger } from './config/logger';

dotenv.config();

const seed = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/google_drive_clone';
    await mongoose.connect(mongoUri);
    logger.info('[Seed] MongoDB ga ulandi');

    const demoEmail = 'demo@disk.uz';
    let user = await User.findOne({ email: demoEmail });

    if (!user) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password123', salt);
      user = await User.create({
        name: 'Demo Foydalanuvchi',
        email: demoEmail,
        password: hashedPassword,
        isEmailVerified: true,
        storageUsed: 120 * 1024 * 1024, // 120 MB
        storageLimit: 15 * 1024 * 1024 * 1024
      });
      logger.info(`[Seed] Demo user yaratildi: ${demoEmail} / password123`);
    } else {
      logger.info(`[Seed] Demo user mavjud: ${demoEmail}`);
    }

    // Check sample folders
    const existingFolders = await Folder.countDocuments({ owner: user._id });
    if (existingFolders === 0) {
      await Folder.create([
        { name: 'Hujjatlar & Shartnomalar', owner: user._id, color: '#4285F4' },
        { name: 'Rasmlar & Gallereya', owner: user._id, color: '#EA4335' },
        { name: 'Ishchi Loyihalar', owner: user._id, color: '#FBBC05' },
        { name: 'Arxivlar', owner: user._id, color: '#34A853' }
      ]);
      logger.info('[Seed] Standart papkalar yaratildi');
    }

    logger.info('[Seed] Muvaffaqiyatli yakunlandi!');
    process.exit(0);
  } catch (error) {
    logger.error('[Seed Error]', error);
    process.exit(1);
  }
};

seed();
