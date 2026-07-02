import { isDbConnected } from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';

export const requireDatabase = (_req, _res, next) => {
  if (!isDbConnected) {
    return next(new ApiError(503, 'Database is not available'));
  }
  next();
};
