// backend/src/__tests__/testDb.ts
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongod: MongoMemoryServer;

export async function connect(): Promise<void> {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri);
}

export async function disconnect(): Promise<void> {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
    await mongod.stop();
}

export async function clearCollections(): Promise<void> {
    const collections = mongoose.connection.collections;
    await Promise.all(Object.values(collections).map((c) => c.deleteMany({})));
}