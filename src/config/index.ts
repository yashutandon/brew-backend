import dotenv from "dotenv";
dotenv.config();

// Centralized config with runtime validation
function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const config = {
  port: parseInt(process.env.PORT || "4000", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  omdbApiKey: requireEnv("OMDB_API_KEY"),
  openaiApiKey: requireEnv("OPENAI_API_KEY"),
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
  omdbBaseUrl: "https://www.omdbapi.com",
};