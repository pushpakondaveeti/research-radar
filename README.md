# Research Radar 🛰️

Research Radar is a modern AI research dashboard that searches the web using **Context.dev APIs**, collects relevant sources, extracts metrics, validates confidence, and builds structured research reports.

It is designed with a premium, glassmorphic dark interface resembling Perplexity, Linear, and Apple's design language.

## Key Features

1. **Intelligent Query Scanner**: Translates unstructured search queries (e.g., *"How many AirPods got sold this year?"*) into structured web queries.
2. **Context.dev Integration**: Connects to the `/v1/web/search` endpoint to fetch indexed web pages and `/v1/web/scrape/markdown` to extract full page markdown.
3. **Fact Extraction Engine**: A Node.js backend parser that identifies numerical stats, currencies, years, and contextual quotes from web pages.
4. **Conflict Range Resolution**: Detects when different sources report conflicting numbers for the same metrics, flagging them as a range and explaining the discrepancy.
5. **Interactive SVG Visualization**: A custom-drawn, glowing SVG line chart mapping historical values without external graphing library bloat.
6. **Credibility Scorer**: Weights source reliability based on domains (SEC filings & Investor Relations = High, Wikipedia = Medium, Forums/Blogs = Low).

---

## Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS v4, Framer Motion, Lucide Icons
- **Backend**: Node.js, Express, ES Modules, dotenv

---

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm

### Installation
1. Clone or copy this directory.
2. Install all dependencies across the root, client, and server workspaces:
   ```bash
   npm run install:all
   ```

### API Key Configuration
Navigate to `backend/.env` and ensure the parameters are configured:
```env
PORT=5050
CONTEXT_API_KEY=ctxt_secret_552a79c33a7442b0a851aac66028b572
CONTEXT_SEARCH_ENDPOINT=https://api.context.dev/v1/web/search
CONTEXT_RESEARCH_ENDPOINT=https://api.context.dev/v1/web/scrape/markdown
```

### Running the App
Start both the backend Express server and Vite frontend dev server concurrently:
```bash
npm start
```

Once running, navigate to:
- Frontend: **[http://localhost:5188](http://localhost:5188)**
- Backend API: **[http://localhost:5050/api/research](http://localhost:5050/api/research)**

---

## Directory Structure

```
research-radar/
├── package.json               # Root config (runs concurrent start)
├── README.md                  # Documentation
├── backend/
│   ├── .env                   # Configuration & API Keys
│   ├── package.json           # Server dependencies
│   └── server.js              # Express app & Fact synthesis engine
└── frontend/
    ├── index.html             # Vite html wrapper
    ├── package.json           # Client dependencies
    ├── vite.config.ts         # Vite bundler & backend proxy config
    ├── tsconfig.json          # TypeScript config
    └── src/
        ├── main.tsx           # React bootstrap entrypoint
        ├── vite-env.d.ts      # Vite types
        ├── index.css          # Tailwind imports & custom glassmorphism
        └── App.tsx            # Main dashboard UI
```

---

## Core Backend Functions

The server implements the following key functions inside `backend/server.js`:

- `researchQuery(query)`: Sends search query to the Context.dev POST endpoint.
- `extractFacts(results)`: Enriches search results by scraping top targets into Markdown, then regex-extracts statistics.
- `rankSources(results)`: Ranks source domains by authority.
- `extractImages(results)`: Scrapes images or fetches domain icons.
- `buildFinalAnswer(facts)`: Determines range variance, identifies conflicts, and calculates the final confidence score.
