import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import compression from 'compression';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { StatusCodes } from 'http-status-codes';
import { connectDB } from './config/db';
import { logger } from './config/logger';
import { morganMiddleware } from './middleware/morgan';
import { errorHandler, AppError } from './middleware/errorHandler';
import authRoutes from './routes/authRoutes';
import folderRoutes from './routes/folderRoutes';
import fileRoutes from './routes/fileRoutes';
import shareRoutes from './routes/shareRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5050;

// Connect to MongoDB
connectDB();

// Middleware
app.use(compression());
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(morganMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    version: '1.0.0',
    time: new Date().toISOString(),
    service: 'MERN Cloud Disk API'
  });
});

// Versioned API Routes (v1)
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/folders', folderRoutes);
app.use('/api/v1/files', fileRoutes);
app.use('/api/v1/share', shareRoutes);

// Backwards compatibility alias
app.use('/api/auth', authRoutes);
app.use('/api/folders', folderRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/share', shareRoutes);

// API 404 Handler for unmatched API endpoints
app.all(['/api', '/api/*'], (req, res) => {
  throw new AppError(
    `Route not found: [${req.method}] ${req.originalUrl}. Please use /api/v1/... format`,
    StatusCodes.NOT_FOUND
  );
});

// Static file serving for React build (Single deployment for Vercel / Node)
const candidateDistPaths = [
  path.resolve(__dirname, '../../web/dist'),
  path.resolve(process.cwd(), 'apps/web/dist'),
  path.resolve(process.cwd(), 'web/dist'),
  path.resolve(__dirname, '../public')
];

const clientDistPath = candidateDistPaths.find((p) => fs.existsSync(p));

if (clientDistPath) {
  logger.info(`[Static] Serving React app from: ${clientDistPath}`);
  app.use(express.static(clientDistPath));

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/health')) {
      return next();
    }
    const indexPath = path.join(clientDistPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      return res.sendFile(indexPath);
    }
    next();
  });
} else {
  logger.info('[Static] Notice: React dist not found yet. Run `turbo run build` or start Vite dev server.');
}

// Global error handler
app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    logger.info(`🚀 [Disk Server] Server started successfully on http://localhost:${PORT}`);
    logger.info(`📚 [API Endpoints] /api/v1/auth, /api/v1/folders, /api/v1/files, /api/v1/share`);
  });
}

export default app;
