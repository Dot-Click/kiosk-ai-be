import mongoose from 'mongoose';
import { logger } from '../functions/logger';

const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://muhammedlayan12_db_user:x3dvp6hVDBINZMJ4@cluster0.bv01kjv.mongodb.net/?appName=Cluster0';
    
    await mongoose.connect(mongoURI);
    
    logger.info('✅ MongoDB Connected Successfully');
    
    mongoose.connection.on('error', (err) => {
      logger.error(`MongoDB connection error: ${err}`);
    });
    
    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });
    
  } catch (error) {
    logger.error(`❌ MongoDB Connection Error: ${error}`);
    process.exit(1);
  }
};

export default connectDB;