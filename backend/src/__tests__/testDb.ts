import mongoose from 'mongoose';

// Locally: connect to the Docker MongoDB (docker-compose up must be running).
// CI: connect to the MongoDB service container via MONGODB_URI_TEST env var.
const TEST_URI = process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/exam_test';

/**
 * Connect Mongoose to the test database.
 * With --runInBand the module cache is shared, so after the first test file
 * connects, subsequent files skip the connect() call.
 */
export async function connect(): Promise<void> {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(TEST_URI);
  }
}

/**
 * Drop the entire test database and disconnect.
 * Called in afterAll() to guarantee full isolation between test files.
 */
export async function disconnect(): Promise<void> {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
}

/**
 * Delete every document in every collection.
 * Called in afterEach() to isolate individual tests within a file.
 */
export async function clearCollections(): Promise<void> {
  const collections = mongoose.connection.collections;
  await Promise.all(Object.values(collections).map((c) => c.deleteMany({})));
}
