import mongoose from 'mongoose';

async function connectToDB(uri?: string) {
    const MONGODB_URI = uri || process.env.MONGODB_URI;
    if (!MONGODB_URI) throw new Error('Please define MONGODB_URI');

    let cached = (global as any).mongoose || { conn: null, promise: null };
    (global as any).mongoose = cached;

    if (cached.conn) return cached.conn;

    if (!cached.promise) {
        cached.promise = mongoose.connect(MONGODB_URI, {
            bufferCommands: false,
        });
    }

    cached.conn = await cached.promise;
    return cached.conn;
}

async function disconnectDB() {
    await mongoose.disconnect();
}

export { connectToDB, disconnectDB };
