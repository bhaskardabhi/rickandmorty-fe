# Rick & Morty Universe Explorer

A modern web application to explore the Rick & Morty universe with AI-powered descriptions, evaluations, and semantic search.

## Features

- **Locations Page**: Browse all locations with AI-generated descriptions and quality evaluations
- **Character Pages**: View character details with AI-generated descriptions, insights, and notes
- **Semantic Search**: Search characters and locations by description using vector embeddings
- **Description Evaluation**: Quality scores for AI-generated descriptions
- **Character Insights**: AI-powered insights and notes about characters
- **Compatibility Analysis**: Analyze how characters would interact together

## Tech Stack

- **React + Vite**: Fast development and builds
- **TypeScript**: Type-safe development
- **Apollo Client**: GraphQL client for data fetching
- **Tailwind CSS**: Modern, responsive styling
- **React Router**: Client-side routing
- **Rick & Morty GraphQL API**: https://rickandmortyapi.com/graphql

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configuration

Create a `.env.local` file in the root of the frontend project:

```bash
# Backend API URL
VITE_BACKEND_URL=http://localhost:3001

# GraphQL API URL (optional, defaults to Rick and Morty API)
VITE_GRAPHQL_URL=https://rickandmortyapi.com/graphql
```

**Important Notes:**
- Only variables prefixed with `VITE_` are exposed to the browser
- `.env.local` is gitignored and should not be committed
- Configuration is centralized in `src/lib/config.ts` for easy access

### 3. Start the Backend Server

The frontend requires the backend server to be running for AI-generated descriptions, evaluations, and search.

**Open a new terminal window/tab:**

```bash
cd rickandmorty-be
npm run dev
```

**Verify it's running:**
```bash
curl http://localhost:3001/health
```

Should return: `{"status":"ok"}`

**Required Backend Environment Variables:**
- `GROQ_API_KEY` - For LLM operations
- `GOOGLE_API_KEY` - For embeddings and vision (optional, for search features)

### 4. Start the Frontend

In a separate terminal:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser

## Running Both Servers

You need **TWO terminal windows**:

**Terminal 1 - Backend:**
```bash
git clone git@github.com:bhaskardabhi/rickandmorty-be.git
cd rickandmorty-be
npm run dev
```

**Terminal 2 - Frontend:**
```bash
git clone git@github.com:bhaskardabhi/rickandmorty-fe.git
cd rickandmorty-fe
npm run dev
```

## Project Structure

```
src/
├── pages/
│   ├── Home.tsx           # Main page with locations and search
│   ├── LocationPage.tsx   # Location details with description and evaluation
│   └── CharacterPage.tsx  # Character details with description, insights, and notes
├── components/
│   └── CharacterCompatibilityGenerator.tsx
├── lib/
│   ├── apollo-client.ts   # Apollo Client configuration
│   ├── config.ts          # Centralized configuration
│   └── graphql/
│       └── queries.ts     # GraphQL queries
├── App.tsx                # Main app with routing
└── main.tsx               # Entry point
```

## Features

### Home Page
- Browse all locations with pagination
- Semantic search with autosuggest for characters and locations
- Search results show character images and location names

### Location Detail Page
- AI-generated location descriptions
- Quality evaluation scores with detailed breakdown
- List of residents with pagination

### Character Detail Page
- AI-generated character descriptions with visual appearance
- Quality evaluation scores with detailed breakdown
- AI-generated insights and notes
- Custom notes functionality
- Episode appearances

## Configuration

### Environment Variables

| Variable | Default | Description |
|---------|---------|-------------|
| `VITE_BACKEND_URL` | `http://localhost:3001` | Backend API server URL |
| `VITE_GRAPHQL_URL` | `https://rickandmortyapi.com/graphql` | GraphQL API endpoint |

### Using Configuration in Code

Instead of using `process.env` directly, use the centralized config:

```typescript
// ❌ Don't do this
const url = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

// ✅ Do this
import { config } from '@/lib/config';
const url = config.backendUrl;
```

This provides:
- Type safety
- Single source of truth
- Easy to update and maintain
- Default values if env vars are not set