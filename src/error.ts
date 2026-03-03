export class MovieNotFoundError extends Error {
  constructor(imdbId: string, reason?: string) {
    super(reason || `No movie found with ID "${imdbId}"`);
    this.name = "MovieNotFoundError";
  }
}

export class OmdbApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OmdbApiError";
  }
}

export class AiAnalysisError extends Error {
  constructor(reason: string) {
    super(`AI analysis failed: ${reason}`);
    this.name = "AiAnalysisError";
  }
}