import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    // Validate environment variable
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    // Connection options for MongoDB driver
    const options = {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 30000,
      maxPoolSize: 10,  // Maximum number of sockets in the connection pool
      family: 4,        // Use IPv4, skip IPv6
    };

    // Establish connection
    await mongoose.connect(process.env.MONGODB_URI, options);
    
    // Connection events
    mongoose.connection.on('connected', () => {
      console.log('✅ MongoDB Connected');
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB Connection Error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB Disconnected');
    });

    // Return the connection promise
    return mongoose.connection;

  } catch (error) {
    console.error('❌ Critical MongoDB Connection Error:', error.message);
    // Graceful shutdown
    process.exit(1);
  }
};