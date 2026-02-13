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
exports.getOrderDetails = exports.getOrders = exports.updateSiteSettings = exports.changePassword = exports.updateProfile = exports.getDashboardStats = exports.adminLogin = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const user_1 = __importDefault(require("../models/User/user"));
const SuccessHandler_1 = require("../utils/SuccessHandler");
const ErrorHandler_1 = require("../utils/ErrorHandler");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// Constants
const ADMIN_EMAIL = "admin12@gmail.com";
const ADMIN_PASSWORD = "admin123";
// Helper function to verify JWT token and get user ID
function getUserIdFromToken(req) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return null;
        }
        const token = authHeader.substring(7);
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            return null;
        }
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        return decoded.id;
    }
    catch (error) {
        return null;
    }
}
// Helper function to ensure Mongoose is connected
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
        yield mongoose_1.default.connect(mongoUri, {
            dbName: 'kiosk-ai',
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
        });
    });
}
// Admin Login - Optimized and Fast
const adminLogin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Ensure Mongoose is connected before using models
        yield ensureMongooseConnected();
        const { email, password } = req.body;
        // Fast validation - return early if invalid
        if (!email || !password) {
            return ErrorHandler_1.ErrorHandler.handleError(new ErrorHandler_1.ApiError(400, "Email and password are required"), req, res);
        }
        // Fast email check - return early if not admin email
        if (email !== ADMIN_EMAIL) {
            return ErrorHandler_1.ErrorHandler.handleError(new ErrorHandler_1.ApiError(401, "Invalid email or password"), req, res);
        }
        // Find admin user - use lean() for faster query, select only needed fields
        let user = yield user_1.default.findOne({ email: ADMIN_EMAIL })
            .select("+password")
            .lean();
        // If admin user doesn't exist, create it (only happens once)
        if (!user) {
            const salt = yield bcryptjs_1.default.genSalt(10);
            const hashedPassword = yield bcryptjs_1.default.hash(ADMIN_PASSWORD, salt);
            // Create with temporary valid password first
            const newAdmin = new user_1.default({
                first_name: "Admin",
                last_name: "User",
                email: ADMIN_EMAIL,
                password: "Temp123!@#", // Temporary valid password to pass validation
                emailVerified: true,
                isActive: true,
            });
            yield newAdmin.save();
            // Update password directly in database to bypass validation
            yield user_1.default.updateOne({ email: ADMIN_EMAIL }, { $set: { password: hashedPassword } });
            // Fetch the created user
            const createdUser = yield user_1.default.findOne({ email: ADMIN_EMAIL })
                .select("+password")
                .lean();
            if (!createdUser) {
                return ErrorHandler_1.ErrorHandler.handleError(new ErrorHandler_1.ApiError(500, "Failed to create admin user"), req, res);
            }
            user = createdUser;
        }
        // Verify password - use bcrypt directly for faster comparison
        const isMatch = yield bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            return ErrorHandler_1.ErrorHandler.handleError(new ErrorHandler_1.ApiError(401, "Invalid email or password"), req, res);
        }
        // Update last login - use updateOne for better performance (no need to fetch full document)
        yield user_1.default.updateOne({ email: ADMIN_EMAIL }, { $set: { lastLogin: new Date() } });
        // Generate JWT token - create user instance only for token generation
        const userDoc = yield user_1.default.findById(user._id);
        if (!userDoc) {
            return ErrorHandler_1.ErrorHandler.handleError(new ErrorHandler_1.ApiError(500, "User not found"), req, res);
        }
        const jwtToken = userDoc.getJWTToken();
        // Return success response
        return SuccessHandler_1.SuccessHandler.handle(res, "Admin logged in successfully", {
            jwtToken,
            user: {
                id: user._id.toString(),
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
            },
        }, 200);
    }
    catch (error) {
        // Log error for debugging
        console.error("Admin login error:", error);
        return ErrorHandler_1.ErrorHandler.handleError(new ErrorHandler_1.ApiError(500, error.message || "Internal server error"), req, res);
    }
});
exports.adminLogin = adminLogin;
// Get Dashboard Stats - Optimized
const getDashboardStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // TODO: Replace with actual database queries when Order and Payment models are created
        // For now, return mock data
        const stats = {
            totalOrders: 0,
            totalPayments: 0,
            pendingOrders: 0,
            completedOrders: 0,
        };
        // Example: When Order model exists, use:
        // const totalOrders = await Order.countDocuments();
        // const totalPayments = await Payment.aggregate([{ $sum: "$amount" }]);
        // const pendingOrders = await Order.countDocuments({ status: "pending" });
        // const completedOrders = await Order.countDocuments({ status: "completed" });
        return SuccessHandler_1.SuccessHandler.handle(res, "Dashboard stats retrieved", stats, 200);
    }
    catch (error) {
        console.error("Dashboard stats error:", error);
        return ErrorHandler_1.ErrorHandler.handleError(new ErrorHandler_1.ApiError(500, error.message || "Internal server error"), req, res);
    }
});
exports.getDashboardStats = getDashboardStats;
// Update Profile Settings
const updateProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield ensureMongooseConnected();
        const userId = getUserIdFromToken(req);
        if (!userId) {
            return ErrorHandler_1.ErrorHandler.handleError(new ErrorHandler_1.ApiError(401, "Unauthorized"), req, res);
        }
        const { firstName, lastName, email } = req.body;
        const user = yield user_1.default.findById(userId);
        if (!user) {
            return ErrorHandler_1.ErrorHandler.handleError(new ErrorHandler_1.ApiError(404, "User not found"), req, res);
        }
        // Update fields
        if (firstName)
            user.first_name = firstName;
        if (lastName)
            user.last_name = lastName;
        if (email && email !== user.email) {
            // Check if email already exists
            const existingUser = yield user_1.default.findOne({ email });
            if (existingUser && existingUser._id.toString() !== userId) {
                return ErrorHandler_1.ErrorHandler.handleError(new ErrorHandler_1.ApiError(400, "Email already in use"), req, res);
            }
            user.email = email;
        }
        yield user.save();
        return SuccessHandler_1.SuccessHandler.handle(res, "Profile updated successfully", {
            user: {
                id: user._id.toString(),
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
            },
        }, 200);
    }
    catch (error) {
        console.error("Update profile error:", error);
        return ErrorHandler_1.ErrorHandler.handleError(new ErrorHandler_1.ApiError(500, error.message || "Internal server error"), req, res);
    }
});
exports.updateProfile = updateProfile;
// Change Password
const changePassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield ensureMongooseConnected();
        const userId = getUserIdFromToken(req);
        if (!userId) {
            return ErrorHandler_1.ErrorHandler.handleError(new ErrorHandler_1.ApiError(401, "Unauthorized"), req, res);
        }
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            return ErrorHandler_1.ErrorHandler.handleError(new ErrorHandler_1.ApiError(400, "Current password and new password are required"), req, res);
        }
        if (newPassword.length < 6) {
            return ErrorHandler_1.ErrorHandler.handleError(new ErrorHandler_1.ApiError(400, "Password must be at least 6 characters"), req, res);
        }
        const user = yield user_1.default.findById(userId).select("+password");
        if (!user) {
            return ErrorHandler_1.ErrorHandler.handleError(new ErrorHandler_1.ApiError(404, "User not found"), req, res);
        }
        // Verify current password
        const isMatch = yield bcryptjs_1.default.compare(currentPassword, user.password);
        if (!isMatch) {
            return ErrorHandler_1.ErrorHandler.handleError(new ErrorHandler_1.ApiError(400, "Current password is incorrect"), req, res);
        }
        // Update password
        const salt = yield bcryptjs_1.default.genSalt(10);
        user.password = yield bcryptjs_1.default.hash(newPassword, salt);
        yield user.save();
        return SuccessHandler_1.SuccessHandler.handle(res, "Password changed successfully", {}, 200);
    }
    catch (error) {
        console.error("Change password error:", error);
        return ErrorHandler_1.ErrorHandler.handleError(new ErrorHandler_1.ApiError(500, error.message || "Internal server error"), req, res);
    }
});
exports.changePassword = changePassword;
// Update Site Settings
const updateSiteSettings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield ensureMongooseConnected();
        const { siteName, siteUrl } = req.body;
        // TODO: Create SiteSettings model to store these settings
        // For now, return success
        const settings = {
            siteName: siteName || "Kiosk AI",
            siteUrl: siteUrl || "",
        };
        return SuccessHandler_1.SuccessHandler.handle(res, "Site settings updated successfully", settings, 200);
    }
    catch (error) {
        console.error("Update site settings error:", error);
        return ErrorHandler_1.ErrorHandler.handleError(new ErrorHandler_1.ApiError(500, error.message || "Internal server error"), req, res);
    }
});
exports.updateSiteSettings = updateSiteSettings;
// Get Orders List
const getOrders = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield ensureMongooseConnected();
        const { status, search } = req.query;
        // TODO: Replace with actual Order model when created
        // For now, return mock data
        const mockOrders = [
            {
                _id: "1",
                orderNumber: "ORD-001",
                customerName: "John Doe",
                customerEmail: "john@example.com",
                totalAmount: 49.99,
                status: "pending",
                createdAt: new Date().toISOString(),
                items: [
                    { productName: "Custom T-Shirt", quantity: 1, price: 49.99 },
                ],
            },
        ];
        let filteredOrders = mockOrders;
        // Filter by status
        if (status && status !== "all") {
            filteredOrders = filteredOrders.filter((order) => order.status === status);
        }
        // Search filter
        if (search) {
            const searchLower = search.toLowerCase();
            filteredOrders = filteredOrders.filter((order) => order.orderNumber.toLowerCase().includes(searchLower) ||
                order.customerName.toLowerCase().includes(searchLower) ||
                order.customerEmail.toLowerCase().includes(searchLower));
        }
        return SuccessHandler_1.SuccessHandler.handle(res, "Orders retrieved", filteredOrders, 200);
    }
    catch (error) {
        console.error("Get orders error:", error);
        return ErrorHandler_1.ErrorHandler.handleError(new ErrorHandler_1.ApiError(500, error.message || "Internal server error"), req, res);
    }
});
exports.getOrders = getOrders;
// Get Order Details
const getOrderDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield ensureMongooseConnected();
        const { id } = req.params;
        // TODO: Replace with actual Order model when created
        // For now, return mock data
        const mockOrder = {
            _id: id,
            orderNumber: "ORD-001",
            customerName: "John Doe",
            customerEmail: "john@example.com",
            totalAmount: 49.99,
            status: "pending",
            createdAt: new Date().toISOString(),
            items: [
                { productName: "Custom T-Shirt", quantity: 1, price: 49.99 },
            ],
            shippingAddress: {
                street: "123 Main St",
                city: "New York",
                state: "NY",
                zip: "10001",
                country: "USA",
            },
        };
        return SuccessHandler_1.SuccessHandler.handle(res, "Order details retrieved", mockOrder, 200);
    }
    catch (error) {
        console.error("Get order details error:", error);
        return ErrorHandler_1.ErrorHandler.handleError(new ErrorHandler_1.ApiError(500, error.message || "Internal server error"), req, res);
    }
});
exports.getOrderDetails = getOrderDetails;
//# sourceMappingURL=adminController.js.map