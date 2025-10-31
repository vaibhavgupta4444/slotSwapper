import mongoose from 'mongoose';

const dbConnect = async (): Promise<void> => {
  try {
    const mongoUrl = process.env.MONGODB_URL;
    
    if (!mongoUrl) {
      throw new Error('MONGODB_URL environment variable is not defined');
    }

    const connection = await mongoose.connect(mongoUrl);

  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};


mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (error) => {
  console.error('Mongoose connection error:', error);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected from MongoDB');
});

process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed through app termination');
    process.exit(0);
  } catch (error) {
    console.error('Error during database disconnection:', error);
    process.exit(1);
  }
});

export default dbConnect;
