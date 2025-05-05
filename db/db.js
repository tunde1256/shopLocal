const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();
const MONGO_URI = process.env.MONGO_URI;
const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};
const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB disconnected');
  } catch (error) {
    console.error('MongoDB disconnection error:', error);
  }
};
const getDB = () => {
  return mongoose.connection;
};
const getDBURI = () => {
  return MONGO_URI; 
};
module.exports = {
  connectDB,
  disconnectDB,
  getDB,
  getDBURI,
};