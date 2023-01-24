import chalk from 'chalk';
import mongoose from 'mongoose';
import keys from '../config/keys.js';
const { database } = keys;

export const setupDB = async () => {
  try {
    // Connect to MongoDB
    mongoose.set('strictQuery', false);
    mongoose
      .connect(database.url, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .then(() => {
        console.log(`${chalk.green('✓')} ${chalk.blue('MongoDB Connected!')}`);
      })
      .catch((err) => {
        console.log('Mongoose connect error:', err);
      });
  } catch (error) {
    console.log(error);
    return null;
  }
};
