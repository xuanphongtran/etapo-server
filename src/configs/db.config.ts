import { MONGO_CLOUD_URL } from '@/constants/env';
import mongoose from 'mongoose';

const connectDatabase = (): void => {
  console.log('Connecting to database');

  // Connecting to the database
  mongoose
    .connect(MONGO_CLOUD_URL as string, {
    })
    .then(() => {
      console.log('Successfully connected to the database');
    })
    .catch((err: Error) => {
      console.log(`Could not connect to the database. Exiting now...\n${err}`);
      process.exit(1);
    });
};

export default connectDatabase;
