"use strict";
// import { CorsOptions } from 'cors';
Object.defineProperty(exports, "__esModule", { value: true });
exports.corsOptions = void 0;
const allowedOrigins = [
    'https://kiosk-ai.vercel.app',
    'http://localhost:4001',
    'http://localhost:5000',
    'https://kiosk-ai-be-production.up.railway.app',
    // REMOVE railway.app from here - it's your backend, not frontend!
    // REMOVE the '*' wildcard - Railway blocks it
];
exports.corsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, postman)
        if (!origin) {
            return callback(null, true);
        }
        // Check if origin is allowed
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        }
        else {
            console.log('❌ CORS blocked origin:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Accept',
        'Origin',
        'Access-Control-Request-Method',
        'Access-Control-Request-Headers'
    ],
    exposedHeaders: [
        'Content-Length',
        'Content-Type',
        'Access-Control-Allow-Origin',
        'Access-Control-Allow-Credentials'
    ],
    maxAge: 86400, // 24 hours
    preflightContinue: false,
    optionsSuccessStatus: 204
};
//# sourceMappingURL=cors.js.map