import jwt from "jsonwebtoken";
import User from "../models/User.js";

export async function requireUser(req, res, next) {
  try {
    const [scheme, token] = (req.headers.authorization || "").split(" ");
    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({ message: "Please sign in to continue." });
    }
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
      return res.status(500).json({ message: "Authentication is not configured." });
    }
    const payload = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ["HS256"], issuer: "cinefree-api", audience: "cinefree-client",
    });
    const user = await User.findById(payload.sub).select("_id name email role");
    if (!user) return res.status(401).json({ message: "Account not found. Please sign in again." });
    req.user = { id: user.id, name: user.name, email: user.email, role: user.role };
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token. Please sign in again." });
  }
}
