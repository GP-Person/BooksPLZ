import dotenv from 'dotenv';
dotenv.config(); // Load environment variables from .env file

import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/googlebooks';

(async () => {
  try {
    // Connect to the MongoDB database
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Successfully connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1); // Exit process if connection fails
  }
})();

const db = mongoose.connection;

export default db;
