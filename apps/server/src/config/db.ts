import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mern_cloud_disk';
    await mongoose.connect(mongoUri);
    console.log(`[Database] MongoDB connected successfully to ${mongoUri}`);
  } catch (error) {
    console.error('[Database] MongoDB connection error:', error);
    process.exit(1);
  }
};
