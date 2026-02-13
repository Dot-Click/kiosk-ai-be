import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import dns from "node:dns";
import User from "../models/User/user";

dotenv.config();

const seedAdmin = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      console.error("❌ MONGODB_URI not set in environment variables");
      process.exit(1);
    }
    
    // Fix for querySrv ECONNREFUSED on Windows
    if (mongoUri?.startsWith('mongodb+srv://')) {
      dns.setServers(['1.1.1.1', '8.8.8.8']);
      console.log('🔧 DNS servers set to public DNS for SRV lookup');
    }
    
    // Connect to database using Mongoose
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(mongoUri, {
      dbName: 'kiosk-ai',
    });
    
    console.log('✅ MongoDB connected via Mongoose');

    const adminEmail = "admin12@gmail.com";
    const adminPassword = "admin123";

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    
    if (existingAdmin) {
      console.log("✅ Admin user already exists");
      // Update password if needed
      const isMatch = await existingAdmin.comparePassword(adminPassword);
      if (!isMatch) {
        // Hash the password manually and update directly in DB to bypass validation
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(adminPassword, salt);
        await User.updateOne(
          { email: adminEmail },
          { $set: { password: hashedPassword } }
        );
        console.log("✅ Admin password updated");
      } else {
        console.log("✅ Admin password is already correct");
      }
      process.exit(0);
    }

    // Create admin user - bypass validation by setting password after creation
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    // Create user with a temporary valid password first
    const adminUser = new User({
      first_name: "Admin",
      last_name: "User",
      email: adminEmail,
      password: "Temp123!@#", // Temporary valid password
      emailVerified: true,
      isActive: true,
    });

    // Save with validation
    await adminUser.save();

    // Now update password directly in database to bypass validation
    await User.updateOne(
      { email: adminEmail },
      { $set: { password: hashedPassword } }
    );

    console.log("✅ Admin user created successfully!");
    console.log(`📧 Email: ${adminEmail}`);
    console.log(`🔑 Password: ${adminPassword}`);
    
    // Close connection
    await mongoose.connection.close();
    console.log("🔌 MongoDB connection closed");
    process.exit(0);
  } catch (error: any) {
    console.error("❌ Error seeding admin:", error.message);
    console.error(error);
    
    // Close connection on error
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
};

seedAdmin();
