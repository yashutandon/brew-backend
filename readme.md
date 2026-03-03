# 🎬 IMDb Sentiment Analyzer — Backend

Node.js + Express + TypeScript REST API that fetches movie data from OMDB
and uses OpenAi  to generate audience sentiment analysis.

---

##  Project Structure
```
brew-backend/
├── src/
│   ├── __tests__/          # Jest unit + integration tests
│   ├── config/             # Centralized env config
│   ├── controllers/        # Route handlers
│   ├── middleware/         # Error handlers
│   ├── routes/             # Express routers
│   ├── services/           # OMDB + OpenAi service logic
│   ├── types/              # Shared TypeScript interfaces
│   └── index.ts            # App entry point
├── .env
├── jest.config.js
├── package.json
└── tsconfig.json
```

---

##  Setup Instructions

### 1. Clone & Install
```bash
git clone https://github.com/yashutandon/brew-backend.git
cd brew-backend
npm install
```

### 2. Configure Environment Variables
```bash
cp .env
```

Edit `.env` and fill in:

| Variable            | Where to get it                               |
| ------------------- | --------------------------------------------- |
| `OMDB_API_KEY`      | https://www.omdbapi.com/apikey.aspx (free)    |
| `OPENAI_API_KEY` | https://platform.openai.com (paid)          |
| `FRONTEND_URL`      | Your Next.js frontend URL (default: localhost:3000) |

### 3. Run in Development
```bash
npm run dev
```

Server starts at `http://localhost:4000`

### 4. Build for Production
```bash
npm run build
npm start
```

### 5. Run Tests
```bash
npm test                # run all tests
npm run test:coverage   # with coverage report
```

---

##  API Endpoints

### `GET /api/movie/:imdbId`

Fetches movie details + AI sentiment analysis.

**Example:** `GET /api/movie/tt0133093`

**Success Response (200):**
```json
{
  "movie": {
    "imdbId": "tt0133093",
    "title": "The Matrix",
    "year": "1999",
    "imdbRating": "8.7",
    "poster": "https://...",
    "cast": [...],
    "plot": "..."
  },
  "sentiment": {
    "classification": "positive",
    "sentimentScore": 90,
    "summary": "...",
    "pros": [...],
    "cons": [...],
    "keyThemes": [...]
  }
}
```

**Error Responses:**

| Code | Error            | Reason                          |
| ---- | ---------------- | ------------------------------- |
| 400  | `INVALID_ID`     | Bad IMDb ID format              |
| 404  | `MOVIE_NOT_FOUND`| OMDB returned no result         |
| 429  | `RATE_LIMITED`   | Too many requests               |
| 500  | `INTERNAL_ERROR` | Server/API failure              |

### `GET /api/health`

Returns server health status.

---

##  Tech Stack Rationale

| Technology      | Reason                                                                |
| --------------- | --------------------------------------------------------------------- |
| **Express**     | Lightweight, mature, minimal overhead for a REST API                 |
| **TypeScript**  | Type safety across all layers eliminates runtime surprises           |
| **OMDB API**    | Free, reliable movie metadata; no scraping required                  |
| **Anthropic SDK**| Claude provides nuanced, contextual sentiment — better than keyword matching |
| **Helmet**      | Sets security-related HTTP headers with zero config                  |
| **express-rate-limit** | Protects against API abuse                                   |
| **Jest + Supertest** | Industry standard for Node.js unit + HTTP integration testing   |

---

##  Assumptions

1. **OMDB covers all required metadata** — cast, poster, plot, ratings are all
   available via OMDB for virtually all IMDb titles.
2. **AI sentiment is derived from metadata** — rather than scraping live IMDb
   reviews (which violates IMDb ToS), Claude infers typical audience perception
   from ratings, awards, genre, and plot. This is both legally safe and
   consistently structured.
3. **Free OMDB tier is sufficient** — 1,000 daily requests covers dev/demo use.
   Production use would require a paid plan.
4. **IMDb IDs are 7–8 digits** — the `tt` + 7–8 digit format covers all
   known IMDb titles as of 2026.