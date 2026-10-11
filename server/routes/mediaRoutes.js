
import { Router } from "express";
import { requireUser } from "../middleware/requireUser.js";
import {
  getMedia,
  getMediaDetails,
  saveMediaSource,
  getAdminMedia,
  deleteMediaSource,
} from "../controllers/mediaController.js";

const router = Router();

router.get("/", getMedia);

router.get("/admin/list", requireUser, (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Admin access required." });
  }
  next();
}, getAdminMedia);

router.post("/admin/source", requireUser, (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Admin access required." });
  }
  next();
}, saveMediaSource);

router.delete("/admin/source/:id", requireUser, (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Admin access required." });
  }
  next();
}, deleteMediaSource);

router.get("/:type/:id", getMediaDetails);

export default router;
