import bcrypt from 'bcryptjs';
import chalk from 'chalk';
import crypto from 'crypto';
import express from 'express';
import jwt from 'jsonwebtoken';
import passport from 'passport';

import User from '../../models/user.js';
import auth from '../../middleware/auth.js';
import { EMAIL_PROVIDER } from '../../constants/index.js';
import keys from '../../config/keys.js';

const authRouter = express.Router();
const { secret, tokenLife } = keys.jwt;

authRouter.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email) {
      return res.status(422).send({ error: 'You must enter an email address' });
    }

    if (!password) {
      return res.status(422).json({ error: 'You must enter a password.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ error: 'No user found for this email address..' });
    }

    if (user && user.provider !== EMAIL_PROVIDER.Email) {
      return res.status(400).json({
        error: `That email address is already in use using ${user.provider} provider.`,
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        error: 'Password Incorrect',
      });
    }

    const payload = {
      id: user.id,
    };

    const token = jwt.sign(payload, secret, { expiresIn: tokenLife });

    res.json({
      success: true,
      token: `Bearer ${token}`,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.log(`${chalk.red('☠')} ${chalk.red(error)}`);
    res.status(400).json({
      error: 'Your request could not be processed. Please try again.',
    });
  }
});

export default authRouter;
