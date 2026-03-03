import { validateImdbId, normalizeMovieData } from "../services/omdb.service";
import { OmdbMovieResponse } from "../types/movie.types";

// ── validateImdbId ────────────────────────────────────────────────────────────
describe("validateImdbId", () => {
  it("accepts valid 7-digit IMDb IDs", () => {
    expect(validateImdbId("tt0133093")).toBe(true);
  });

  it("accepts valid 8-digit IMDb IDs", () => {
    expect(validateImdbId("tt12345678")).toBe(true);
  });

  it("rejects IDs without tt prefix", () => {
    expect(validateImdbId("0133093")).toBe(false);
  });

  it("rejects IDs with too few digits", () => {
    expect(validateImdbId("tt12345")).toBe(false);
  });

  it("rejects empty strings", () => {
    expect(validateImdbId("")).toBe(false);
  });

  it("rejects random strings", () => {
    expect(validateImdbId("matrix")).toBe(false);
  });
});

// ── normalizeMovieData ────────────────────────────────────────────────────────
describe("normalizeMovieData", () => {
  const mockRaw: OmdbMovieResponse = {
    Title: "The Matrix",
    Year: "1999",
    Rated: "R",
    Released: "31 Mar 1999",
    Runtime: "136 min",
    Genre: "Action, Sci-Fi",
    Director: "Lana Wachowski, Lilly Wachowski",
    Writer: "Lana Wachowski (screenplay), Lilly Wachowski",
    Actors: "Keanu Reeves, Laurence Fishburne, Carrie-Anne Moss",
    Plot: "A hacker discovers the world is a simulation.",
    Language: "English",
    Country: "United States",
    Awards: "Won 4 Oscars.",
    Poster: "https://example.com/poster.jpg",
    Ratings: [{ Source: "Internet Movie Database", Value: "8.7/10" }],
    Metascore: "73",
    imdbRating: "8.7",
    imdbVotes: "1,900,000",
    imdbID: "tt0133093",
    Type: "movie",
    Response: "True",
  };

  it("maps genre string to array", () => {
    const result = normalizeMovieData(mockRaw);
    expect(result.genre).toEqual(["Action", "Sci-Fi"]);
  });

  it("includes actors with role=actor", () => {
    const result = normalizeMovieData(mockRaw);
    const actors = result.cast.filter((c) => c.role === "actor");
    expect(actors.map((a) => a.name)).toContain("Keanu Reeves");
  });

  it("includes directors with role=director", () => {
    const result = normalizeMovieData(mockRaw);
    const directors = result.cast.filter((c) => c.role === "director");
    expect(directors.map((d) => d.name)).toContain("Lana Wachowski");
  });

  it("strips parenthetical notes from writer names", () => {
    const result = normalizeMovieData(mockRaw);
    const writers = result.cast.filter((c) => c.role === "writer");
    expect(writers[0].name).toBe("Lana Wachowski");
  });

  it("sets imdbId correctly", () => {
    const result = normalizeMovieData(mockRaw);
    expect(result.imdbId).toBe("tt0133093");
  });
});