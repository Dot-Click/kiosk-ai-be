"use strict";
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
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const node_dns_1 = __importDefault(require("node:dns"));
const user_1 = __importDefault(require("../models/User/user"));
dotenv_1.default.config();
const seedAdmin = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const mongoUri = process.env.MONGODB_URI;
        if (!mongoUri) {
            console.error("❌ MONGODB_URI not set in environment variables");
            process.exit(1);
        }
        // Fix for querySrv ECONNREFUSED on Windows
        if (mongoUri === null || mongoUri === void 0 ? void 0 : mongoUri.startsWith('mongodb+srv://')) {
            node_dns_1.default.setServers(['1.1.1.1', '8.8.8.8']);
            console.log('🔧 DNS servers set to public DNS for SRV lookup');
        }
        // Connect to database using Mongoose
        console.log('🔗 Connecting to MongoDB...');
        yield mongoose_1.default.connect(mongoUri, {
            dbName: 'kiosk-ai',
        });
        console.log('✅ MongoDB connected via Mongoose');
        const adminEmail = "admin12@gmail.com";
        const adminPassword = "admin123";
        // Check if admin already exists
        const existingAdmin = yield user_1.default.findOne({ email: adminEmail });
        if (existingAdmin) {
            console.log("✅ Admin user already exists");
            // Update password if needed
            const isMatch = yield existingAdmin.comparePassword(adminPassword);
            if (!isMatch) {
                // Hash the password manually and update directly in DB to bypass validation
                const salt = yield bcryptjs_1.default.genSalt(10);
                const hashedPassword = yield bcryptjs_1.default.hash(adminPassword, salt);
                yield user_1.default.updateOne({ email: adminEmail }, { $set: { password: hashedPassword } });
                console.log("✅ Admin password updated");
            }
            else {
                console.log("✅ Admin password is already correct");
            }
            process.exit(0);
        }
        // Create admin user - bypass validation by setting password after creation
        const salt = yield bcryptjs_1.default.genSalt(10);
        const hashedPassword = yield bcryptjs_1.default.hash(adminPassword, salt);
        // Create user with a temporary valid password first
        const adminUser = new user_1.default({
            first_name: "Admin",
            last_name: "User",
            email: adminEmail,
            password: "Temp123!@#", // Temporary valid password
            emailVerified: true,
            isActive: true,
        });
        // Save with validation
        yield adminUser.save();
        // Now update password directly in database to bypass validation
        yield user_1.default.updateOne({ email: adminEmail }, { $set: { password: hashedPassword } });
        console.log("✅ Admin user created successfully!");
        console.log(`📧 Email: ${adminEmail}`);
        console.log(`🔑 Password: ${adminPassword}`);
        // Close connection
        yield mongoose_1.default.connection.close();
        console.log("🔌 MongoDB connection closed");
        process.exit(0);
    }
    catch (error) {
        console.error("❌ Error seeding admin:", error.message);
        console.error(error);
        // Close connection on error
        if (mongoose_1.default.connection.readyState !== 0) {
            yield mongoose_1.default.connection.close();
        }
        process.exit(1);
    }
});
seedAdmin();
//# sourceMappingURL=seedAdmin.js.map