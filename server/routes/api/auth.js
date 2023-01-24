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
import * as mailchimp from '../../services/mailchimp.js';
import * as mailgun from '../../services/mailgun.js';

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
        error: 'Incorrect email/password',
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

authRouter.post('/register', async (req, res) => {
  try {
    const { email, firstName, lastName, password, isSubscribed } = req.body;

    if (!email) {
      return res.status(422).json({
        error: 'You must enter an email address.',
      });
    }

    if (!firstName || !lastName) {
      return res.status(422).json({
        error: 'You must enter your full name.',
      });
    }

    if (!password) {
      return res.status(422).json({
        error: 'You must enter a password.',
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        error: 'That email address is already in use.',
      });
    }

    let subscribed = false;

    if (isSubscribed) {
      const result = await mailchimp.subscribeToNewstletter(email);

      if (result.status === 'subscribed') {
        subscribed = true;
      }
    }

    const user = new User({
      email,
      password,
      firstName,
      lastName,
    });

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(user.password, salt);

    user.password = hash;
    const registeredUser = await user.save();

    const payload = {
      id: registeredUser.id,
    };

    await mailgun.sendEmail(
      registeredUser.email,
      'signup',
      null,
      registeredUser
    );

    const token = jwt.sign(payload, secret, { expiresIn: tokenLife });

    res.json({
      success: true,
      subscribed,
      token: `Bearer ${token}`,
      user: {
        id: registeredUser.id,
        firstName: registeredUser.firstName,
        lastName: registeredUser.lastName,
        email: registeredUser.email,
        role: registeredUser.role,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      error: 'Your request could not be processed. Please try again.',
    });
  }
});

authRouter.post('/forgot', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res
        .status(422)
        .json({ error: 'You must enter an email address.' });
    }

    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      return res
        .status(422)
        .json({ error: 'No user found for this email address.' });
    }

    const buffer = crypto.randomBytes(48);
    const resetToken = buffer.toString('hex');

    const date = new Date();
    existingUser.resetPasswordToken = resetToken;
    existingUser.resetPasswordExpires = new Date(new Date(date).setHours(date.getHours() +  2));

    existingUser.save();

    await mailgun.sendEmail(
      existingUser.email,
      'reset',
      req.headers.host,
      resetToken
    );

    return res.json({
      success: true,
      message: 'Please check your email for the link to reset your password.',
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      error: 'Your request could not be processed. Please try again.',
    });
  }
});

authRouter.post('/reset/:token', async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(422).json({ error: 'You must enter a password.' });
    }

    const currentTime = new Date().toISOString();

    const resetUser = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: currentTime },
    });

    if (!resetUser) {
      return res.status(400).json({
        error:
          'Your token has expired. Please attempt to reset your password again.',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    resetUser.password = hash;
    resetUser.resetPasswordToken = undefined;
    resetUser.resetPasswordExpires = undefined;

    resetUser.save();

    await mailgun.sendEmail(resetUser.email, 'reset-confirmation');

    return res.json({
      success: true,
      message:
        'Password changed successfully. Please login with your new password.',
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      error: 'Your request could not be processed. Please try again.',
    });
  }
});

export default authRouter;
