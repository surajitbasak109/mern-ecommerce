import express from 'express';
import User from '../../models/user.js';
import * as mailgun from '../../services/mailgun.js';
import * as mailchimp from '../../services/mailchimp.js';

const testRouter = express.Router();

testRouter.get('/mail', async (req, res) => {
  const user = await User.findOne();
  try {
    await mailgun.sendEmail('surajitbasak109@gmail.com', 'signup', null, user);
    return res.json({ message: 'mail sent' });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ error: 'Something went wrong, please see the log' });
  }
});

testRouter.get('/mailchimp', async (req, res) => {
  try {
    const result = await mailchimp.subscribeToNewstletter("avijitbasak931@gmail.com");
    console.log(result);
    return res.json({ message: 'mailchimp subscribed' });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ error: 'Something went wrong, please see the log' });
  }
});

export default testRouter;
