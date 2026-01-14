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
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
let db = null;
let mongoClient = null;
function connectDB() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const mongoUri = process.env.MONGODB_URI;
            console.log('🔍 Checking MongoDB configuration...');
            console.log('📝 MONGODB_URI exists:', !!mongoUri);
            if (!mongoUri) {
                console.log('⚠️  MONGODB_URI not set in environment variables');
                console.log('⚠️  Using in-memory storage only');
                return null;
            }
            // Clean up the URI - ensure it ends with database name
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
            console.log('🔗 Connecting to MongoDB with URI (masked):', cleanUri.replace(/:[^:@]*@/, ':****@'));
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
            console.log('✅ MongoDB connected successfully!');
            console.log('📊 Database:', db.databaseName);
            return db;
        }
        catch (error) {
            console.error('❌ MongoDB connection failed:', error.message);
            // Log more details for debugging
            if (error.code === 'ENOTFOUND') {
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
        if (mongoClient) {
            yield mongoClient.close();
            console.log('🔌 MongoDB connection closed');
            db = null;
            mongoClient = null;
        }
    });
}
//# sourceMappingURL=db.js.map