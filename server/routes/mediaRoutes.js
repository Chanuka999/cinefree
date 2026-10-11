
import { Router } from "express";
import {
  getMedia,
  getMediaDetails,
} from "../controllers/mediaController.js";

const router = Router();

router.get("/", getMedia);
router.get("/:type/:id", getMediaDetails);

export default router;
