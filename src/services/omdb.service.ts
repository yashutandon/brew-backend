import axios from "axios";
import { config } from "../config";
import { OmdbMovieResponse, MovieData, CastMember } from "../types/movie.types";
import { MovieNotFoundError, OmdbApiError } from "../error";

/**
 * Validates the format of an IMDb ID (e.g., tt0133093 or tt12345678)
 */
export function validateImdbId(id: string): boolean {
  return /^tt\d{7,8}$/.test(id.trim());
}

/**
 * Fetches raw movie data directly from the OMDB API
 */
async function fetchFromOmdb(imdbId: string): Promise<OmdbMovieResponse> {
  const response = await axios.get<OmdbMovieResponse>(config.omdbBaseUrl, {
    params: {
      apikey: config.omdbApiKey,
      i: imdbId,
      plot: "full",
    },
    timeout: 10_000,
  });

  // OMDB always returns 200 but signals failure via Response field
  if (response.data.Response === "False") {
    const reason = response.data.Error || "Movie not found";
    const isNotFound =
      reason.toLowerCase().includes("not found") ||
      reason.toLowerCase().includes("incorrect imdb");

    throw isNotFound
      ? new MovieNotFoundError(imdbId, reason)
      : new OmdbApiError(reason);
  }

  return response.data;
}

/**
 * Parses comma-separated names and strips parenthetical notes
 * e.g. "Lana Wachowski (screenplay)" → { name: "Lana Wachowski", role }
 */
function parsePeople(raw: string, role: CastMember["role"]): CastMember[] {
  if (!raw || raw === "N/A") return [];
  return raw
    .split(",")
    .map((entry) => entry.replace(/\(.*?\)/g, "").trim())
    .filter(Boolean)
    .map((name) => ({ name, role }));
}

/**
 * Transforms the raw OMDB response into our clean MovieData shape
 */
export function normalizeMovieData(raw: OmdbMovieResponse): MovieData {
  const cast: CastMember[] = [
    ...parsePeople(raw.Actors, "actor"),
    ...parsePeople(raw.Director, "director"),
    ...parsePeople(raw.Writer, "writer"),
  ];

  return {
    imdbId: raw.imdbID,
    title: raw.Title,
    year: raw.Year,
    rated: raw.Rated,
    released: raw.Released,
    runtime: raw.Runtime,
    genre:
      raw.Genre !== "N/A" ? raw.Genre.split(",").map((g) => g.trim()) : [],
    director: raw.Director,
    cast,
    plot: raw.Plot,
    language: raw.Language,
    country: raw.Country,
    awards: raw.Awards,
    poster: raw.Poster !== "N/A" ? raw.Poster : "",
    ratings: (raw.Ratings || []).map((r) => ({
      source: r.Source,
      value: r.Value,
    })),
    imdbRating: raw.imdbRating,
    imdbVotes: raw.imdbVotes,
    metascore: raw.Metascore,
  };
}

/**
 * Public service: fetch + normalize a movie by IMDb ID
 */
export async function getMovieById(imdbId: string): Promise<MovieData> {
  const raw = await fetchFromOmdb(imdbId);
  return normalizeMovieData(raw);
}