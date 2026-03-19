const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/aitee');

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    console.log("Make sure MongoDB is running locally or provide a valid MONGO_URI in .env");
    // Don't exit process in dev/setup phase to allow server to run even if DB fails initially
    // process.exit(1); 
  }
};

module.exports = connectDB;
