// import mongoose from 'mongoose';
// import dotenv from 'dotenv';

// dotenv.config();

// const mongoUri = process.env.MONGODB_URI;

// let isConnected = false;

// export async function connectDB() {
//   try {
//     if (!mongoUri) {
//       console.log('❌ MONGODB_URI not set in environment variables');
//       return false;
//     }

//     if (isConnected) {
//       console.log('✅ Already connected to MongoDB');
//       return true;
//     }

//     await mongoose.connect(mongoUri, {
//       dbName: 'kiosk-ai',
//     });

//     isConnected = true;
//     console.log('✅ MongoDB connected successfully');
//     return true;
//   } catch (error) {
//     console.error('❌ MongoDB connection failed:', error);
//     return false;
//   }
// }

// export function checkConnection() {
//   return mongoose.connection.readyState === 1; // 1 = connected
// }

// // Optional connection event handlers
// mongoose.connection.on('connected', () => {
//   console.log('✅ Mongoose connected to MongoDB');
// });

// mongoose.connection.on('error', (err) => {
//   console.error('❌ Mongoose connection error:', err);
//   isConnected = false;
// });

// mongoose.connection.on('disconnected', () => {
//   console.log('⚠️ Mongoose disconnected from MongoDB');
//   isConnected = false;
// });

// // For app termination
// process.on('SIGINT', async () => {
//   await mongoose.connection.close();
//   console.log('✅ MongoDB connection closed');
//   process.exit(0);
// });

// import { MongoClient, Db } from 'mongodb';
// import dotenv from 'dotenv';

// dotenv.config();

// let db: Db | null = null;
// const mongoUri = process.env.MONGODB_URI;

// export async function connectDB() {
//   try {
//     if (!mongoUri) {
//       console.log('⚠️  MONGODB_URI not set, using in-memory storage');
//       return null;
//     }

//     const client = new MongoClient(mongoUri);
//     await client.connect();
//     db = client.db('kiosk-ai');
//     console.log('✅ MongoDB connected');
//     return db;
//   } catch (error) {
//     console.error('❌ MongoDB connection failed:', error);
//     return null;
//   }
// }

// export function getDB() {
//   return db;
// }

// export function isDBConnected() {
//   return db !== null;
// }


import { MongoClient, Db } from 'mongodb';
import mongoose from 'mongoose';
import dns from 'node:dns';
import dotenv from 'dotenv';

dotenv.config();

let db: Db | null = null;
let mongoClient: MongoClient | null = null;
let mongooseConnected = false;

export async function connectDB() {
  try {
    const mongoUri = process.env.MONGODB_URI;

    console.log('🔍 Checking MongoDB configuration...');
    console.log('📝 MONGODB_URI exists:', !!mongoUri);

    if (!mongoUri) {
      console.log('⚠️  MONGODB_URI not set in environment variables');
      console.log('⚠️  Using in-memory storage only');
      return null;
    }

    // Fix for querySrv ECONNREFUSED on Windows (Node.js DNS resolver issue).
    // Use public DNS so SRV lookup for mongodb+srv:// can succeed.
    if (mongoUri?.startsWith('mongodb+srv://')) {
      dns.setServers(['1.1.1.1', '8.8.8.8']); // Cloudflare and Google DNS
      console.log('🔧 DNS servers set to public DNS (1.1.1.1, 8.8.8.8) for SRV lookup');
    }

    // Connect Mongoose first (required for Mongoose models)
    if (!mongooseConnected && mongoose.connection.readyState === 0) {
      console.log('🔗 Connecting Mongoose to MongoDB...');
      await mongoose.connect(mongoUri, {
        dbName: 'kiosk-ai',
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
      });
      mongooseConnected = true;
      console.log('✅ Mongoose connected successfully!');

      // Mongoose connection event handlers
      mongoose.connection.on('connected', () => {
        console.log('✅ Mongoose connected to MongoDB');
      });

      mongoose.connection.on('error', (err) => {
        console.error('❌ Mongoose connection error:', err);
        mongooseConnected = false;
      });

      mongoose.connection.on('disconnected', () => {
        console.log('⚠️ Mongoose disconnected from MongoDB');
        mongooseConnected = false;
      });
    } else if (mongoose.connection.readyState === 1) {
      console.log('✅ Mongoose already connected');
      mongooseConnected = true;
    }

    // Clean up the URI - ensure it ends with database name (for native driver)
    let cleanUri = mongoUri.trim();

    // Remove trailing slash if exists
    if (cleanUri.endsWith('/')) {
      cleanUri = cleanUri.slice(0, -1);
    }

    // If URI doesn't end with database name, add it
    if (!cleanUri.includes('/?') && !cleanUri.endsWith('/kiosk-ai')) {
      if (cleanUri.includes('?')) {
        // Insert database name before query parameters
        cleanUri = cleanUri.replace('?', '/kiosk-ai?');
      } else {
        // Append database name
        cleanUri = `${cleanUri}/kiosk-ai`;
      }
    }

    console.log('🔗 Connecting native MongoDB driver with URI (masked):',
      cleanUri.replace(/:[^:@]*@/, ':****@'));

    const client = new MongoClient(cleanUri, {
      serverApi: {
        version: '1',
        strict: true,
        deprecationErrors: true,
      },
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    await client.connect();

    // Test the connection
    await client.db().admin().ping();

    mongoClient = client;
    db = client.db('kiosk-ai');

    console.log('✅ Native MongoDB driver connected successfully!');
    console.log('📊 Database:', db.databaseName);

    // FIX: Drop legacy index that causes duplicate key errors
    try {
      const collection = db.collection('orders');
      const indexes = await collection.indexes();
      const hasBadIndex = indexes.some(idx => idx.name === 'stripePaymentIntentId_1');
      if (hasBadIndex) {
        console.log('🔧 Found legacy index "stripePaymentIntentId_1". Dropping it...');
        await collection.dropIndex('stripePaymentIntentId_1');
        console.log('✅ Legacy index dropped successfully.');
      }
    } catch (idxError) {
      console.warn('⚠️  Failed to check/drop legacy index (non-fatal):', idxError);
    }

    return db;
  } catch (error: any) {
    console.error('❌ MongoDB connection failed:', error.message);

    // Log more details for debugging
    if (error.message?.includes('querySrv') || error.message?.includes('ECONNREFUSED')) {
      console.error('💡 DNS SRV lookup failed (common on Windows).');
      console.error('💡 Solutions:');
      console.error('   1. Use Google/Cloudflare DNS (8.8.8.8, 1.1.1.1)');
      console.error('   2. Disable VPN if active');
      console.error('   3. In MongoDB Atlas, use "Standard" connection string instead of SRV');
    } else if (error.code === 'ENOTFOUND') {
      console.error('❌ DNS lookup failed. Check MongoDB hostname.');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('❌ Connection timeout. Check network/firewall.');
    } else if (error.code === 'MongoServerSelectionError') {
      console.error('❌ Server selection error. Check credentials/permissions.');
    }

    return null;
  }
}

export function getDB() {
  return db;
}

export function isDBConnected() {
  return db !== null && mongoClient !== null;
}

export async function closeDB() {
  // Close Mongoose connection
  if (mongooseConnected && mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
    console.log('🔌 Mongoose connection closed');
    mongooseConnected = false;
  }

  // Close native MongoDB driver connection
  if (mongoClient) {
    await mongoClient.close();
    console.log('🔌 Native MongoDB connection closed');
    db = null;
    mongoClient = null;
  }
}

export async function ensureMongooseConnected() {
  // If already connected, return immediately
  if (mongoose.connection.readyState === 1) {
    return;
  }

  // If connecting, wait for it
  if (mongoose.connection.readyState === 2) {
    return new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("Mongoose connection timeout"));
      }, 10000);

      mongoose.connection.once('connected', () => {
        clearTimeout(timeout);
        resolve();
      });

      mongoose.connection.once('error', (err) => {
        clearTimeout(timeout);
        reject(err);
      });
    });
  }

  // If disconnected or uninitialized, connect now
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error("MONGODB_URI not set");
  }

  // Reuse the connectDB logic to ensure full initialization
  await connectDB();
}

export function isMongooseConnected() {
  return mongooseConnected && mongoose.connection.readyState === 1;
}