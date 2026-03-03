import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { config } from "./config";
import routes from "./routes";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";

const app = express();

// ── Security & Logging Middleware ────────────────────────────────────────────
app.use(helmet());
app.use(morgan(config.nodeEnv === "production" ? "combined" : "dev"));

// ── CORS ─────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: config.frontendUrl,
    methods: ["GET"],
    allowedHeaders: ["Content-Type"],
  })
);

// ── Rate Limiting: 60 requests per 15 minutes per IP ─────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  message: {
    error: "RATE_LIMITED",
    message: "Too many requests. Please wait before trying again.",
  },
});
app.use("/api", limiter);

// ── Body Parsing ─────────────────────────────────────────────────────────────
app.use(express.json());

// ── Routes ───────────────────────────────────────────────────────────────────
app.use("/api", routes);

// ── Error Handling ───────────────────────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

// ── Start Server ─────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== "test") {
  app.listen(config.port, () => {
    console.log(` Server running at http://localhost:${config.port}`);
    console.log(`   Environment: ${config.nodeEnv}`);
  });
}

export default app;