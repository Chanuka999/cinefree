
import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import mediaRoutes from "./routes/mediaRoutes.js";
import videoRoutes from "./routes/videoRoutes.js";

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "CineFree API is running" });
});

app.use("/api/media", mediaRoutes);
app.use("/api/video", videoRoutes);

app.use((err, req, res, next) => {
  console.error(err.message);

  const status = err.status || 500;

  res.status(status).json({
    success: false,
    message:
      status === 500
        ? "Something went wrong. Check the server logs."
        : err.message,
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`CineFree API running at http://localhost:${PORT}`);
});
