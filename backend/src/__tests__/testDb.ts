import mongoose from 'mongoose';


const TEST_URI = process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/exam_test';

export async function connect(): Promise<void> {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(TEST_URI);
  }
}

export async function disconnect(): Promise<void> {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
}

export async function clearCollections(): Promise<void> {
  const collections = mongoose.connection.collections;
  await Promise.all(Object.values(collections).map((c) => c.deleteMany({})));
}
