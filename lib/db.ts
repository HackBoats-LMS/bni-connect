import { MongoClient, Db } from 'mongodb';

const uri = process.env.DATABASE_URL!;
const dbName = 'bni-connect';

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function getDb(): Promise<Db> {
  if (cachedDb) return cachedDb;

  const client = new MongoClient(uri);
  await client.connect();

  cachedClient = client;
  cachedDb = client.db(dbName);

  return cachedDb;
}

// Convenience helper to get the users collection
export async function getUsersCollection() {
  const db = await getDb();
  return db.collection('users');
}
