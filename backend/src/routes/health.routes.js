import { Router } from 'express';
import { isDbConnected } from '../config/db.js';

const router = Router();

router.get('/', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Sunday School API is running',
    database: isDbConnected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
});

export default router;
