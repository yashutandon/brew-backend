import request from "supertest";
import app from "../index";
import * as omdbService from "../services/omdb.service";
import * as aiService from "../services/ai.service";
import { MovieData, SentimentAnalysis } from "../types/movie.types";

// Mock both services so tests run without real API calls
jest.mock("../services/omdb.service");
jest.mock("../services/ai.service");
jest.mock("../config", () => ({
  config: {
    port: 4001,
    nodeEnv: "test",
    omdbApiKey: "test-key",
    anthropicApiKey: "test-key",
    frontendUrl: "http://localhost:3000",
    omdbBaseUrl: "https://www.omdbapi.com",
  },
}));

const mockMovie: MovieData = {
  imdbId: "tt0133093",
  title: "The Matrix",
  year: "1999",
  rated: "R",
  released: "31 Mar 1999",
  runtime: "136 min",
  genre: ["Action", "Sci-Fi"],
  director: "Lana Wachowski",
  cast: [{ name: "Keanu Reeves", role: "actor" }],
  plot: "A hacker discovers the world is a simulation.",
  language: "English",
  country: "United States",
  awards: "Won 4 Oscars.",
  poster: "https://example.com/poster.jpg",
  ratings: [{ source: "IMDb", value: "8.7/10" }],
  imdbRating: "8.7",
  imdbVotes: "1,900,000",
  metascore: "73",
};

const mockSentiment: SentimentAnalysis = {
  summary: "A landmark film loved by audiences.",
  keyThemes: ["reality", "freedom"],
  audienceReception: "Widely acclaimed.",
  sentimentScore: 90,
  classification: "positive",
  pros: ["Innovative visuals", "Great acting"],
  cons: ["Complex plot"],
};

describe("GET /api/movie/:imdbId", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 200 with movie and sentiment for valid IMDb ID", async () => {
    (omdbService.getMovieById as jest.Mock).mockResolvedValue(mockMovie);
    (aiService.analyzeSentiment as jest.Mock).mockResolvedValue(mockSentiment);

    const res = await request(app).get("/api/movie/tt0133093");
    expect(res.status).toBe(200);
    expect(res.body.movie.title).toBe("The Matrix");
    expect(res.body.sentiment.classification).toBe("positive");
  });

  it("returns 400 for invalid IMDb ID format", async () => {
    const res = await request(app).get("/api/movie/invalid-id");
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("INVALID_ID");
  });

  it("returns 404 when movie is not found", async () => {
    (omdbService.getMovieById as jest.Mock).mockRejectedValue(
      new Error("Movie not found!")
    );

    const res = await request(app).get("/api/movie/tt9999999");
    expect(res.status).toBe(404);
    expect(res.body.error).toBe("MOVIE_NOT_FOUND");
  });

  it("returns 500 on unexpected service error", async () => {
    (omdbService.getMovieById as jest.Mock).mockRejectedValue(
      new Error("Database connection failed")
    );

    const res = await request(app).get("/api/movie/tt0133093");
    expect(res.status).toBe(500);
    expect(res.body.error).toBe("INTERNAL_ERROR");
  });

  it("health check returns ok", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });
});