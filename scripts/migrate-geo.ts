import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const uri = process.env.DATABASE_URL;

if (!uri) {
  console.error('Please add your Mongo URI to .env or .env.local');
  process.exit(1);
}

async function migrate() {
  console.log('Connecting to MongoDB...');
  const client = new MongoClient(uri as string);

  try {
    await client.connect();
    const db = client.db('bni-connect');
    const users = db.collection('users');

    console.log('Fetching users to migrate...');
    const allUsers = await users.find({}).toArray();

    let migratedCount = 0;

    for (const user of allUsers) {
      if (user.latitude != null && user.longitude != null) {
        const lat = parseFloat(user.latitude);
        const lng = parseFloat(user.longitude);

        if (!isNaN(lat) && !isNaN(lng)) {
          // Add GeoJSON location field
          await users.updateOne(
            { _id: user._id },
            {
              $set: {
                location: {
                  type: 'Point',
                  coordinates: [lng, lat], // GeoJSON is [longitude, latitude]
                },
              },
            }
          );
          migratedCount++;
        }
      }
    }

    console.log(`Migrated ${migratedCount} users with GeoJSON location fields.`);

    // Create 2dsphere index
    console.log('Creating 2dsphere index on location field...');
    await users.createIndex({ location: '2dsphere' });
    console.log('Index created successfully.');

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB.');
  }
}

migrate();
