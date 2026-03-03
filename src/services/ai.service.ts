import OpenAI from "openai";
import { config } from "../config";
import { MovieData, SentimentAnalysis } from "../types/movie.types";
import { AiAnalysisError } from "../error";

// OpenAI client initialize karo
const openai = new OpenAI({
  apiKey: config.openaiApiKey, // Make sure aap config.ts me ye add kar lo
});

/**
 * Builds structured prompt
 */
function buildSentimentPrompt(movie: MovieData): string {
  return `
Analyze the following movie metadata and return structured JSON.

Movie Details:
- Title: ${movie.title} (${movie.year})
- Genre: ${movie.genre.join(", ")}
- Director: ${movie.director}
- Cast: ${movie.cast
    .filter((c) => c.role === "actor")
    .map((c) => c.name)
    .join(", ")}
- IMDb Rating: ${movie.imdbRating}/10 (${movie.imdbVotes} votes)
- Metascore: ${movie.metascore}
- Awards: ${movie.awards}
- Plot: ${movie.plot}
- Ratings: ${movie.ratings.map((r) => `${r.source}: ${r.value}`).join(" | ")}

Return STRICT JSON with this exact schema:

{
  "summary": "string",
  "keyThemes": ["string"],
  "audienceReception": "string",
  "sentimentScore": number,
  "classification": "positive | mixed | negative",
  "pros": ["string"],
  "cons": ["string"]
}

Rules:
- sentimentScore must be 0–100
- classification must follow:
  >=65 → positive
  <=35 → negative
  else → mixed
- Do not include any explanations.
`;
}

/**
 * Validate AI output
 */
function validateSentiment(data: any): asserts data is SentimentAnalysis {
  if (!data.summary || typeof data.summary !== "string")
    throw new Error("Invalid summary");

  if (!Array.isArray(data.keyThemes))
    throw new Error("Invalid keyThemes");

  if (typeof data.sentimentScore !== "number")
    throw new Error("Invalid sentimentScore");

  if (!["positive", "mixed", "negative"].includes(data.classification))
    throw new Error("Invalid classification");
}

/**
 * Retry wrapper — Handles OpenAI rate limits (429) and transient errors
 */
async function generateWithRetry(prompt: string, retries = 2, delayMs = 1000): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Cost-effective aur fast for JSON tasks
      messages: [
        { 
          role: "system", 
          content: "You are a professional film critic and sentiment analyst. You must output strictly in JSON format." 
        },
        { 
          role: "user", 
          content: prompt 
        }
      ],
      response_format: { type: "json_object" }, // Yeh OpenAI ko force karega proper JSON dene ke liye
      temperature: 0.4,
      max_tokens: 1200,
    });

    return response.choices[0].message.content || "{}";
  } catch (err: any) {
    console.error("[OpenAI ERROR]", {
      status: err?.status,
      message: err?.message,
      type: err?.type
    });

    if (retries <= 0) {
      throw new AiAnalysisError(
        err instanceof Error ? err.message : "OpenAI API failed after all retries"
      );
    }

    let waitTime = delayMs;

    // Handle Rate Limits (429) & Server Errors (5xx)
    if (err?.status === 429 || err?.status >= 500) {
      // OpenAI usually sends back headers for rate limit, but standard exponential backoff works best here
      waitTime = delayMs * 2; 
      console.warn(`[API ERROR] Status ${err?.status}. Retrying in ${waitTime}ms...`);
      
      await new Promise((res) => setTimeout(res, waitTime));
      return generateWithRetry(prompt, retries - 1, waitTime);
    }

    // Agar koi dusra error hai (e.g. Invalid API key, Bad request 400), toh retry mat karo
    throw new AiAnalysisError(
      err instanceof Error ? err.message : "Non-retryable OpenAI error"
    );
  }
}

/**
 * Main production function
 */
export async function analyzeSentiment(
  movie: MovieData
): Promise<SentimentAnalysis> {
  const prompt = buildSentimentPrompt(movie);

  const rawText = await generateWithRetry(prompt);

  let parsed: SentimentAnalysis;

  try {
    // OpenAI ka json_object mode guarantee karta hai clean JSON, toh directly parse kar sakte hain
    parsed = JSON.parse(rawText);
  } catch (err) {
    throw new AiAnalysisError(
      `Malformed JSON from OpenAI: ${err instanceof Error ? err.message : String(err)}`
    );
  }

  validateSentiment(parsed);

  return parsed;
}