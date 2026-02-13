import { Request, Response } from "express";
import mongoose from "mongoose";
import User from "../models/User/user";
import { SuccessHandler } from "../utils/SuccessHandler";
import { ErrorHandler, ApiError } from "../utils/ErrorHandler";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Constants
const ADMIN_EMAIL = "admin12@gmail.com";
const ADMIN_PASSWORD = "admin123";

// Helper function to verify JWT token and get user ID
function getUserIdFromToken(req: Request): string | null {
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

    const decoded = jwt.verify(token, secret) as { id: string };
    return decoded.id;
  } catch (error) {
    return null;
  }
}

// Helper function to ensure Mongoose is connected
async function ensureMongooseConnected() {
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
  
  await mongoose.connect(mongoUri, {
    dbName: 'kiosk-ai',
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
  });
}

// Admin Login - Optimized and Fast
export const adminLogin = async (req: Request, res: Response) => {
  try {
    // Ensure Mongoose is connected before using models
    await ensureMongooseConnected();
    
    const { email, password } = req.body;

    // Fast validation - return early if invalid
    if (!email || !password) {
      return ErrorHandler.handleError(
        new ApiError(400, "Email and password are required"),
        req,
        res
      );
    }

    // Fast email check - return early if not admin email
    if (email !== ADMIN_EMAIL) {
      return ErrorHandler.handleError(
        new ApiError(401, "Invalid email or password"),
        req,
        res
      );
    }

    // Find admin user - use lean() for faster query, select only needed fields
    let user = await User.findOne({ email: ADMIN_EMAIL })
      .select("+password")
      .lean();

    // If admin user doesn't exist, create it (only happens once)
    if (!user) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);

      // Create with temporary valid password first
      const newAdmin = new User({
        first_name: "Admin",
        last_name: "User",
        email: ADMIN_EMAIL,
        password: "Temp123!@#", // Temporary valid password to pass validation
        emailVerified: true,
        isActive: true,
      });

      await newAdmin.save();

      // Update password directly in database to bypass validation
      await User.updateOne(
        { email: ADMIN_EMAIL },
        { $set: { password: hashedPassword } }
      );

      // Fetch the created user
      const createdUser = await User.findOne({ email: ADMIN_EMAIL })
        .select("+password")
        .lean();

      if (!createdUser) {
        return ErrorHandler.handleError(
          new ApiError(500, "Failed to create admin user"),
          req,
          res
        );
      }

      user = createdUser;
    }

    // Verify password - use bcrypt directly for faster comparison
    const isMatch = await bcrypt.compare(password, user.password as string);
    if (!isMatch) {
      return ErrorHandler.handleError(
        new ApiError(401, "Invalid email or password"),
        req,
        res
      );
    }

    // Update last login - use updateOne for better performance (no need to fetch full document)
    await User.updateOne(
      { email: ADMIN_EMAIL },
      { $set: { lastLogin: new Date() } }
    );

    // Generate JWT token - create user instance only for token generation
    const userDoc = await User.findById(user._id);
    if (!userDoc) {
      return ErrorHandler.handleError(
        new ApiError(500, "User not found"),
        req,
        res
      );
    }

    const jwtToken = userDoc.getJWTToken();

    // Return success response
    return SuccessHandler.handle(
      res,
      "Admin logged in successfully",
      {
        jwtToken,
        user: {
          id: user._id.toString(),
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
        },
      },
      200
    );
  } catch (error: any) {
    // Log error for debugging
    console.error("Admin login error:", error);
    return ErrorHandler.handleError(
      new ApiError(500, error.message || "Internal server error"),
      req,
      res
    );
  }
};

// Get Dashboard Stats - Optimized
export const getDashboardStats = async (req: Request, res: Response) => {
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

    return SuccessHandler.handle(res, "Dashboard stats retrieved", stats, 200);
  } catch (error: any) {
    console.error("Dashboard stats error:", error);
    return ErrorHandler.handleError(
      new ApiError(500, error.message || "Internal server error"),
      req,
      res
    );
  }
};

// Update Profile Settings
export const updateProfile = async (req: Request, res: Response) => {
  try {
    await ensureMongooseConnected();
    
    const userId = getUserIdFromToken(req);
    if (!userId) {
      return ErrorHandler.handleError(
        new ApiError(401, "Unauthorized"),
        req,
        res
      );
    }

    const { firstName, lastName, email } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return ErrorHandler.handleError(
        new ApiError(404, "User not found"),
        req,
        res
      );
    }

    // Update fields
    if (firstName) user.first_name = firstName;
    if (lastName) user.last_name = lastName;
    if (email && email !== user.email) {
      // Check if email already exists
      const existingUser = await User.findOne({ email });
      if (existingUser && existingUser._id.toString() !== userId) {
        return ErrorHandler.handleError(
          new ApiError(400, "Email already in use"),
          req,
          res
        );
      }
      user.email = email;
    }

    await user.save();

    return SuccessHandler.handle(
      res,
      "Profile updated successfully",
      {
        user: {
          id: user._id.toString(),
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
        },
      },
      200
    );
  } catch (error: any) {
    console.error("Update profile error:", error);
    return ErrorHandler.handleError(
      new ApiError(500, error.message || "Internal server error"),
      req,
      res
    );
  }
};

// Change Password
export const changePassword = async (req: Request, res: Response) => {
  try {
    await ensureMongooseConnected();
    
    const userId = getUserIdFromToken(req);
    if (!userId) {
      return ErrorHandler.handleError(
        new ApiError(401, "Unauthorized"),
        req,
        res
      );
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return ErrorHandler.handleError(
        new ApiError(400, "Current password and new password are required"),
        req,
        res
      );
    }

    if (newPassword.length < 6) {
      return ErrorHandler.handleError(
        new ApiError(400, "Password must be at least 6 characters"),
        req,
        res
      );
    }

    const user = await User.findById(userId).select("+password");
    if (!user) {
      return ErrorHandler.handleError(
        new ApiError(404, "User not found"),
        req,
        res
      );
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password as string);
    if (!isMatch) {
      return ErrorHandler.handleError(
        new ApiError(400, "Current password is incorrect"),
        req,
        res
      );
    }

    // Update password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    return SuccessHandler.handle(res, "Password changed successfully", {}, 200);
  } catch (error: any) {
    console.error("Change password error:", error);
    return ErrorHandler.handleError(
      new ApiError(500, error.message || "Internal server error"),
      req,
      res
    );
  }
};

// Update Site Settings
export const updateSiteSettings = async (req: Request, res: Response) => {
  try {
    await ensureMongooseConnected();
    
    const { siteName, siteUrl } = req.body;

    // TODO: Create SiteSettings model to store these settings
    // For now, return success
    const settings = {
      siteName: siteName || "Kiosk AI",
      siteUrl: siteUrl || "",
    };

    return SuccessHandler.handle(
      res,
      "Site settings updated successfully",
      settings,
      200
    );
  } catch (error: any) {
    console.error("Update site settings error:", error);
    return ErrorHandler.handleError(
      new ApiError(500, error.message || "Internal server error"),
      req,
      res
    );
  }
};

// Get Orders List
export const getOrders = async (req: Request, res: Response) => {
  try {
    await ensureMongooseConnected();
    
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
      const searchLower = (search as string).toLowerCase();
      filteredOrders = filteredOrders.filter(
        (order) =>
          order.orderNumber.toLowerCase().includes(searchLower) ||
          order.customerName.toLowerCase().includes(searchLower) ||
          order.customerEmail.toLowerCase().includes(searchLower)
      );
    }

    return SuccessHandler.handle(res, "Orders retrieved", filteredOrders, 200);
  } catch (error: any) {
    console.error("Get orders error:", error);
    return ErrorHandler.handleError(
      new ApiError(500, error.message || "Internal server error"),
      req,
      res
    );
  }
};

// Get Order Details
export const getOrderDetails = async (req: Request, res: Response) => {
  try {
    await ensureMongooseConnected();
    
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

    return SuccessHandler.handle(res, "Order details retrieved", mockOrder, 200);
  } catch (error: any) {
    console.error("Get order details error:", error);
    return ErrorHandler.handleError(
      new ApiError(500, error.message || "Internal server error"),
      req,
      res
    );
  }
};
