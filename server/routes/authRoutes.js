import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";
import User from "../models/User.js";
import { requireUser } from "../middleware/requireUser.js";

const router = express.Router();
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: "draft-7", legacyHeaders: false });
function createToken(user) {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) throw new Error("JWT_SECRET must be at least 32 characters");
  return jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET, {
    algorithm: "HS256", expiresIn: "2h", issuer: "cinefree-api", audience: "cinefree-client",
  });
}
router.post("/register", limiter, async (req, res) => {
  try {
    const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
    const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const password = typeof req.body.password === "string" ? req.body.password : "";
    if (name.length < 2 || name.length > 80) return res.status(400).json({ message: "Name must be 2–80 characters." });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) return res.status(400).json({ message: "Enter a valid email address." });
    if (password.length < 10 || password.length > 72) return res.status(400).json({ message: "Password must be 10–72 characters." });
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, passwordHash });
    return res.status(201).json({ message: "Account created.", token: createToken(user), user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    if (error?.code === 11000) return res.status(409).json({ message: "An account with this email already exists." });
    console.error("Register error:", error.message);
    return res.status(500).json({ message: "Unable to create account." });
  }
});
router.post("/login", limiter, async (req, res) => {
  try {
    const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const password = typeof req.body.password === "string" ? req.body.password : "";
    if (!email || !password) return res.status(400).json({ message: "Email and password are required." });
    const user = await User.findOne({ email }).select("+passwordHash");
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) return res.status(401).json({ message: "Invalid email or password." });
    return res.json({ message: "Signed in.", token: createToken(user), user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    console.error("Login error:", error.message);
    return res.status(500).json({ message: "Unable to sign in." });
  }
});
router.get("/me", requireUser, (req, res) => res.json({ user: req.user }));
export default router;
