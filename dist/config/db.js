"use strict";
// import mongoose from 'mongoose';
// import dotenv from 'dotenv';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = connectDB;
exports.getDB = getDB;
exports.isDBConnected = isDBConnected;
exports.closeDB = closeDB;
exports.ensureMongooseConnected = ensureMongooseConnected;
exports.isMongooseConnected = isMongooseConnected;
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
const mongodb_1 = require("mongodb");
const mongoose_1 = __importDefault(require("mongoose"));
const node_dns_1 = __importDefault(require("node:dns"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
let db = null;
let mongoClient = null;
let mongooseConnected = false;
function connectDB() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
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
            if (mongoUri === null || mongoUri === void 0 ? void 0 : mongoUri.startsWith('mongodb+srv://')) {
                node_dns_1.default.setServers(['1.1.1.1', '8.8.8.8']); // Cloudflare and Google DNS
                console.log('🔧 DNS servers set to public DNS (1.1.1.1, 8.8.8.8) for SRV lookup');
            }
            // Connect Mongoose first (required for Mongoose models)
            if (!mongooseConnected && mongoose_1.default.connection.readyState === 0) {
                console.log('🔗 Connecting Mongoose to MongoDB...');
                yield mongoose_1.default.connect(mongoUri, {
                    dbName: 'kiosk-ai',
                    serverSelectionTimeoutMS: 10000,
                    socketTimeoutMS: 45000,
                });
                mongooseConnected = true;
                console.log('✅ Mongoose connected successfully!');
                // Mongoose connection event handlers
                mongoose_1.default.connection.on('connected', () => {
                    console.log('✅ Mongoose connected to MongoDB');
                });
                mongoose_1.default.connection.on('error', (err) => {
                    console.error('❌ Mongoose connection error:', err);
                    mongooseConnected = false;
                });
                mongoose_1.default.connection.on('disconnected', () => {
                    console.log('⚠️ Mongoose disconnected from MongoDB');
                    mongooseConnected = false;
                });
            }
            else if (mongoose_1.default.connection.readyState === 1) {
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
                }
                else {
                    // Append database name
                    cleanUri = `${cleanUri}/kiosk-ai`;
                }
            }
            console.log('🔗 Connecting native MongoDB driver with URI (masked):', cleanUri.replace(/:[^:@]*@/, ':****@'));
            const client = new mongodb_1.MongoClient(cleanUri, {
                serverApi: {
                    version: '1',
                    strict: true,
                    deprecationErrors: true,
                },
                connectTimeoutMS: 10000,
                socketTimeoutMS: 45000,
            });
            yield client.connect();
            // Test the connection
            yield client.db().admin().ping();
            mongoClient = client;
            db = client.db('kiosk-ai');
            console.log('✅ Native MongoDB driver connected successfully!');
            console.log('📊 Database:', db.databaseName);
            // FIX: Drop legacy index that causes duplicate key errors
            try {
                const collection = db.collection('orders');
                const indexes = yield collection.indexes();
                const hasBadIndex = indexes.some(idx => idx.name === 'stripePaymentIntentId_1');
                if (hasBadIndex) {
                    console.log('🔧 Found legacy index "stripePaymentIntentId_1". Dropping it...');
                    yield collection.dropIndex('stripePaymentIntentId_1');
                    console.log('✅ Legacy index dropped successfully.');
                }
            }
            catch (idxError) {
                console.warn('⚠️  Failed to check/drop legacy index (non-fatal):', idxError);
            }
            return db;
        }
        catch (error) {
            console.error('❌ MongoDB connection failed:', error.message);
            // Log more details for debugging
            if (((_a = error.message) === null || _a === void 0 ? void 0 : _a.includes('querySrv')) || ((_b = error.message) === null || _b === void 0 ? void 0 : _b.includes('ECONNREFUSED'))) {
                console.error('💡 DNS SRV lookup failed (common on Windows).');
                console.error('💡 Solutions:');
                console.error('   1. Use Google/Cloudflare DNS (8.8.8.8, 1.1.1.1)');
                console.error('   2. Disable VPN if active');
                console.error('   3. In MongoDB Atlas, use "Standard" connection string instead of SRV');
            }
            else if (error.code === 'ENOTFOUND') {
                console.error('❌ DNS lookup failed. Check MongoDB hostname.');
            }
            else if (error.code === 'ETIMEDOUT') {
                console.error('❌ Connection timeout. Check network/firewall.');
            }
            else if (error.code === 'MongoServerSelectionError') {
                console.error('❌ Server selection error. Check credentials/permissions.');
            }
            return null;
        }
    });
}
function getDB() {
    return db;
}
function isDBConnected() {
    return db !== null && mongoClient !== null;
}
function closeDB() {
    return __awaiter(this, void 0, void 0, function* () {
        // Close Mongoose connection
        if (mongooseConnected && mongoose_1.default.connection.readyState !== 0) {
            yield mongoose_1.default.connection.close();
            console.log('🔌 Mongoose connection closed');
            mongooseConnected = false;
        }
        // Close native MongoDB driver connection
        if (mongoClient) {
            yield mongoClient.close();
            console.log('🔌 Native MongoDB connection closed');
            db = null;
            mongoClient = null;
        }
    });
}
function ensureMongooseConnected() {
    return __awaiter(this, void 0, void 0, function* () {
        // If already connected, return immediately
        if (mongoose_1.default.connection.readyState === 1) {
            return;
        }
        // If connecting, wait for it
        if (mongoose_1.default.connection.readyState === 2) {
            return new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error("Mongoose connection timeout"));
                }, 10000);
                mongoose_1.default.connection.once('connected', () => {
                    clearTimeout(timeout);
                    resolve();
                });
                mongoose_1.default.connection.once('error', (err) => {
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
        yield connectDB();
    });
}
function isMongooseConnected() {
    return mongooseConnected && mongoose_1.default.connection.readyState === 1;
}
//# sourceMappingURL=db.js.map