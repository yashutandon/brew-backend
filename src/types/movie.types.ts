// ─────────────────────────────────────────────────────────────────────────────
// Raw shape returned by the OMDB API
// ─────────────────────────────────────────────────────────────────────────────
export interface OmdbMovieResponse {
  Title: string;
  Year: string;
  Rated: string;
  Released: string;
  Runtime: string;
  Genre: string;
  Director: string;
  Writer: string;
  Actors: string;
  Plot: string;
  Language: string;
  Country: string;
  Awards: string;
  Poster: string;
  Ratings: Array<{ Source: string; Value: string }>;
  Metascore: string;
  imdbRating: string;
  imdbVotes: string;
  imdbID: string;
  Type: string;
  Response: string; // "True" | "False"
  Error?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Normalized movie data sent to the frontend
// ─────────────────────────────────────────────────────────────────────────────
export interface MovieData {
  imdbId: string;
  title: string;
  year: string;
  rated: string;
  released: string;
  runtime: string;
  genre: string[];
  director: string;
  cast: CastMember[];
  plot: string;
  language: string;
  country: string;
  awards: string;
  poster: string;
  ratings: Rating[];
  imdbRating: string;
  imdbVotes: string;
  metascore: string;
}

export interface CastMember {
  name: string;
  role: "actor" | "director" | "writer";
}

export interface Rating {
  source: string;
  value: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// AI Sentiment result
// ─────────────────────────────────────────────────────────────────────────────
export interface SentimentAnalysis {
  summary: string;
  keyThemes: string[];
  audienceReception: string;
  sentimentScore: number; // 0–100
  classification: "positive" | "mixed" | "negative";
  pros: string[];
  cons: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Combined response sent to the frontend
// ─────────────────────────────────────────────────────────────────────────────
export interface MovieAnalysisResponse {
  movie: MovieData;
  sentiment: SentimentAnalysis;
}

export interface ApiErrorResponse {
  error: string;
  message: string;
}