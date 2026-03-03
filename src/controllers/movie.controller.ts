import { Request, Response } from "express";
import { validateImdbId, getMovieById } from "../services/omdb.service";
import { analyzeSentiment } from "../services/ai.service";
import { MovieAnalysisResponse, ApiErrorResponse } from "../types/movie.types";
import { MovieNotFoundError, OmdbApiError, AiAnalysisError } from "../error";

/**
 * GET /api/movie/:imdbId
 * Fetches movie details and AI sentiment analysis
 */
export async function getMovieAnalysis(
  req: Request,
  res: Response
): Promise<void> {
  const { imdbId } = req.params;

  // ── Validation ──────────────────────────────────────────────────────────
  if (!imdbId || !imdbId.trim()) {
    res.status(400).json({
      error: "MISSING_ID",
      message: "IMDb ID is required.",
    } satisfies ApiErrorResponse);
    return;
  }

  if (!validateImdbId(imdbId)) {
    res.status(400).json({
      error: "INVALID_ID",
      message:
        "Invalid IMDb ID format. Expected format: tt followed by 7–8 digits (e.g., tt0133093).",
    } satisfies ApiErrorResponse);
    return;
  }

  // ── Fetch & Analyze ──────────────────────────────────────────────────────
  try {
    const movie = await getMovieById(imdbId.trim());
    const sentiment = await analyzeSentiment(movie);

    const response: MovieAnalysisResponse = { movie, sentiment };
    res.status(200).json(response);
  } catch (error) {
    if (error instanceof MovieNotFoundError) {
      res.status(404).json({
        error: "MOVIE_NOT_FOUND",
        message: error.message,
      } satisfies ApiErrorResponse);
      return;
    }

    if (error instanceof OmdbApiError) {
      res.status(502).json({
        error: "OMDB_ERROR",
        message: "Failed to retrieve movie data from OMDB.",
      } satisfies ApiErrorResponse);
      return;
    }

    if (error instanceof AiAnalysisError) {
      res.status(502).json({
        error: "AI_SERVICE_ERROR",
        message: "Sentiment analysis is temporarily unavailable.",
      } satisfies ApiErrorResponse);
      return;
    }

    console.error(`[MovieController] Unexpected error for ${imdbId}:`, error);
    res.status(500).json({
      error: "INTERNAL_ERROR",
      message: "Something went wrong while fetching movie data.",
    } satisfies ApiErrorResponse);
  }
}