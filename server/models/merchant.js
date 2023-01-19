import Mongoose from 'mongoose';

import { MERCHANT_STATUS } from '../constants/index.js';

const { Schema } = Mongoose;

const MerchantSchema = new Schema({
  name: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
  },
  phoneNumber: {
    type: String,
  },
  brandName: {
    type: String,
  },
  business: {
    type: String,
    trim: true,
  },
  isActive: {
    type: Boolean,
    default: false,
  },
  brand: {
    type: Schema.Types.ObjectId,
    ref: 'Brand',
    default: null,
  },
  status: {
    type: String,
    default: MERCHANT_STATUS.Waiting_Approval,
    enum: [
      MERCHANT_STATUS.Waiting_Approval,
      MERCHANT_STATUS.Rejected,
      MERCHANT_STATUS.Approved,
    ],
  },
  updated: Date,
  created: {
    type: Date,
    default: Date.now,
  },
});

export default Mongoose.model('Merchant', MerchantSchema);
