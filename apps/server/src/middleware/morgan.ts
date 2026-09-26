import morgan from 'morgan';
import { morganStream } from '../config/logger';

export const morganMiddleware = morgan(
  ':method :url :status :res[content-length] - :response-time ms',
  { stream: morganStream }
);
