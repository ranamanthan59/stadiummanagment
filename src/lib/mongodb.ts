import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI && process.env.NODE_ENV === 'production') {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.production or your hosting provider settings');
}

const connectionString = MONGODB_URI || 'mongodb://127.0.0.1:27017/smart-stadium';

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache;
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      connectTimeoutMS: 5000, // 5 seconds timeout
      serverSelectionTimeoutMS: 5000,
    };

    cached.promise = mongoose.connect(connectionString, opts).then((mongoose) => {
      console.log('✅ MongoDB Connected');
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error('CRITICAL: MongoDB connection failed.');
    console.error('Make sure your MongoDB server is running locally on port 27017 or check your MONGODB_URI.');
    console.error('Error details:', (e as Error).message);
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
