import mongoose from 'mongoose';
import { env } from './env.js';

export let isDbConnected = false;

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(env.mongodbUri, {
      serverSelectionTimeoutMS: 5000,
    });
    isDbConnected = true;
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    isDbConnected = false;

    if (env.nodeEnv === 'production') {
      console.error('MongoDB connection error:', error.message);
      process.exit(1);
    }

    console.warn(
      'MongoDB connection error:',
      error.message,
      '\nServer will start without a database connection. Start MongoDB and restart the server.',
    );
  }
};

export const disconnectDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    isDbConnected = false;
  }
};
