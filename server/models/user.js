import Mongoose from 'mongoose';

import { ROLES, EMAIL_PROVIDER } from '../constants/index.js';

const { Schema } = Mongoose;

// User schema
const UserSchema = new Schema({
  email: {
    type: String,
    required() {
      return this.provider !== 'email' ? false : true;
    },
  },
  phoneNumber: { type: String },
  firstName: { type: String },
  lastName: { type: String },
  password: { type: String },
  merchant: {
    type: Schema.Types.ObjectId,
    ref: 'Merchant',
    default: null,
  },
  provider: {
    type: String,
    required: true,
    default: EMAIL_PROVIDER.Email,
  },
  googleId: { type: String },
  facebookId: { type: String },
  avatar: { type: String },
  role: {
    type: String,
    default: ROLES.Member,
    enum: [ROLES.Admin, ROLES.Member, ROLES.Merchant],
  },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  updated: Date,
  created: {
    type: Date,
    default: Date.now,
  },
});

const User = Mongoose.model('User', UserSchema);

export default User;
