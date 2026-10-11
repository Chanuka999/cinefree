
import express from "express";
import { getPlayback, getDownload } from "../services/videoProvider.js";

const router = express.Router();

// Replace with your existing authentication middleware.
function requireUser(req, res, next) {
  if (!req.user?.id) {
    return res.status(401).json({
      message: "Please sign in to continue.",
    });
  }

  next();
}

// Replace these with database-backed lookups and entitlement checks.
async function resolveAuthorizedAsset(tmdbId, userId, action) {
  // Find the mapping between TMDB ID and the provider's asset ID.
  // Check regional availability, subscription and download rights.
  // Return null when the asset is not authorized.
  throw new Error("Connect resolveAuthorizedAsset to your database");
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
