import { Router } from "express";
import movieRoutes from "./movie.routes";

const router = Router();

router.use("/movie", movieRoutes);

// Health check endpoint
router.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

export default router;