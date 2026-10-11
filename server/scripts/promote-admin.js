import "dotenv/config";
import mongoose from "mongoose";
import User from "../models/User.js";

const email = process.argv[2]?.trim().toLowerCase();

if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  console.error("Usage: npm run promote-admin -- user@example.com");
  process.exitCode = 1;
} else {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is missing");
    }

    await mongoose.connect(process.env.MONGODB_URI);
    const result = await User.updateOne({ email }, { $set: { role: "admin" } });

    if (result.matchedCount === 0) {
      console.error(`No account found for ${email}. Register it first, then run this command again.`);
      process.exitCode = 1;
    } else {
      console.log(`${email} is now an admin.`);
    }
  } catch (error) {
    console.error(`Could not promote account: ${error.message}`);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}
