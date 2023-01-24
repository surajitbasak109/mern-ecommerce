import MailChimp from 'mailchimp-api-v3';

import keys from '../config/keys.js';

const { key, listKey } = keys.mailchimp;

class MailChimpService {
  init() {
    try {
      return new MailChimp(key);
    } catch (error) {
      console.warn('Missing mailchimp keys');
    }
  }
}

const mailchimp = new MailChimpService().init();
export const subscribeToNewstletter = async (email) => {
  try {
    return await mailchimp.post(`lists/${listKey}/members`, {
      email_address: email,
      status: 'subscribed',
    });
  } catch (error) {
    return error;
  }
};
