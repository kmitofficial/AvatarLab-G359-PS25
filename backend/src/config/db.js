require('dotenv').config();  // Load environment variables from .env file

const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGO_URI;  // Access the MongoDB URI from environment variables
        if (!mongoURI) {
            throw new Error('MongoDB URI is not defined in the environment variables.');
        }

        await mongoose.connect(mongoURI);  // Simplified without deprecated options
        console.log('MongoDB connected...');
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
