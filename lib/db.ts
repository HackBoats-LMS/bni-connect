import { MongoClient, Db } from 'mongodb';

if (!process.env.DATABASE_URL) {
  throw new Error('Please add your Mongo URI to .env.local');
}

const uri = process.env.DATABASE_URL;
const dbName = 'bni-connect';

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    const client = new MongoClient(uri);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  const client = new MongoClient(uri);
  clientPromise = client.connect();
}

export async function getDb(): Promise<Db> {
  const client = await clientPromise;
  return client.db(dbName);
}

// Convenience helper to get the users collection
export async function getUsersCollection() {
  const db = await getDb();
  return db.collection('users');
}

// Convenience helper to get the notifications collection
export async function getNotificationsCollection() {
  const db = await getDb();
  return db.collection('notifications');
}


