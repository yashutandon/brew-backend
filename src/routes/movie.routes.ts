import { Router } from "express";
import { getMovieAnalysis } from "../controllers/movie.controller";

const router = Router();

// GET /api/movie/:imdbId
router.get("/:imdbId", getMovieAnalysis);

export default router;