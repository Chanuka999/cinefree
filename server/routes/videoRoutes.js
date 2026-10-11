
import express from "express";
import { getPlayback, getDownload } from "../services/videoProvider.js";
import { requireUser } from "../middleware/requireUser.js";

const router = express.Router();

// Fail closed until a database-backed licensed asset mapping is implemented.
async function resolveAuthorizedAsset(tmdbId, userId, action) {
  return null;
}

router.get("/:tmdbId/playback", requireUser, async (req, res) => {
  try {
    const asset = await resolveAuthorizedAsset(
      req.params.tmdbId,
      req.user.id,
      "playback"
    );

    if (!asset) {
      return res.status(404).json({
        message: "Movie is unavailable for playback.",
      });
    }

    const playback = await getPlayback(asset.providerAssetId);

    res.set("Cache-Control", "no-store");
    res.json(playback);
  } catch (error) {
    console.error("Playback error:", error.message);
    res.status(502).json({
      message: "Unable to start playback.",
    });
  }
});

router.get("/:tmdbId/download", requireUser, async (req, res) => {
  try {
    const asset = await resolveAuthorizedAsset(
      req.params.tmdbId,
      req.user.id,
      "download"
    );

    if (!asset) {
      return res.status(403).json({
        message: "Download is not available for this account.",
      });
    }

    const download = await getDownload(asset.providerAssetId);

    res.set("Cache-Control", "no-store");
    res.json(download);
  } catch (error) {
    console.error("Download error:", error.message);
    res.status(502).json({
      message: "Unable to prepare the download.",
    });
  }
});

export default router;
