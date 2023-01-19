import express from 'express';

const router = express.Router();
import authRouter from './auth.js';

// auth routes
router.use('/auth', authRouter);

export default router;
