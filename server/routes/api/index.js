import express from 'express';

const router = express.Router();
import authRouter from './auth.js';
import testRouter from './test.js';

// auth routes
router.use('/auth', authRouter);
router.use('/test', testRouter);

export default router;
