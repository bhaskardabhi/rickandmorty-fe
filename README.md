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

## Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn** package manager
- **Backend server** running (see backend README for setup)

## Setup

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
cd ../rickandmorty-be  # or navigate to your backend directory
npm install
npm run dev
```

**Verify it's running:**
```bash
curl http://localhost:3001/health
```

Should return: `{"status":"ok"}`

**Required Backend Environment Variables:**
- `GROQ_API_KEY` - For LLM operations
- `GOOGLE_API_KEY` - For embeddings and vision (required for search features)

### 4. Start the Frontend

In a separate terminal:

```bash
npm run dev
```

The frontend will start on `http://localhost:5173` (Vite default port).

### Verifying Setup

1. **Backend health check**: `GET http://localhost:3001/health` should return `{"status":"ok"}`
2. **Frontend**: Open `http://localhost:5173` in your browser
3. **Test features**:
   - Browse locations on the home page
   - Click a location to see AI-generated description
   - Search for characters or locations using the search bar
   - Navigate to a character page to see insights and notes

## Development

### Running Both Servers

You need **TWO terminal windows**:

**Terminal 1 - Backend:**
```bash
cd rickandmorty-be
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd rickandmorty-fe
npm run dev
```

### Building for Production

```bash
npm run build
```

The production build will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
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

## Architecture & Design Decisions

This section documents the key architectural decisions made in building this frontend application.

### GraphQL vs REST for Data Fetching

**Decision: GraphQL for external API, REST for backend API**

**Rationale:**
- **GraphQL for Rick & Morty API**: 
  - The external API provides GraphQL, allowing efficient data fetching
  - Apollo Client provides excellent caching, error handling, and React integration
  - We can fetch exactly the fields needed for each page (character details, location info, etc.)
  - Nested relationships (character → episodes, location → residents) are fetched in single queries
  
- **REST for Backend API**:
  - Our backend uses REST endpoints for AI operations (descriptions, evaluations, insights)
  - REST is simpler for stateless operations like generating descriptions
  - No need for GraphQL complexity when we're just making POST requests with simple parameters
  - Easier to cache at HTTP level and integrate with standard fetch API

### Frontend Caching Strategy

**Decision: localStorage-based caching for AI-generated content**

**Rationale:**
- **localStorage for descriptions and insights**:
  - AI-generated content is expensive to regenerate (LLM API calls)
  - Once generated, descriptions don't change (they're based on static character/location data)
  - localStorage provides persistent cache across browser sessions
  - Cache keys are entity-specific (`character_description_${id}`, `location_description_${id}`)
  
- **Apollo Client cache for GraphQL data**:
  - Apollo's InMemoryCache handles GraphQL query results automatically
  - Provides efficient cache normalization and deduplication
  - Works seamlessly with React hooks (`useQuery`)
  
- **User data persistence**:
  - User notes and evaluation scores stored in localStorage
  - Persists across sessions without requiring backend storage
  - Simple key-value storage is sufficient for this use case

### State Management

**Decision: React hooks (useState, useEffect) with component-level state**

**Rationale:**
- **No global state management library**: 
  - Application state is relatively simple and component-scoped
  - No need for Redux or Zustand for this scale of application
  - React's built-in state management is sufficient
  
- **Component-level state**:
  - Each page component manages its own state (descriptions, evaluations, loading states)
  - State is passed down to child components via props when needed
  - Keeps components independent and testable
  
- **Apollo Client for server state**:
  - Apollo handles all server state (GraphQL queries) automatically
  - Provides loading, error, and data states out of the box
  - Eliminates need for manual server state management

### Component Architecture

**Decision: Page-based components with minimal reusable components**

**Rationale:**
- **Page components** (`Home.tsx`, `CharacterPage.tsx`, `LocationPage.tsx`):
  - Each page is a self-contained component with its own data fetching and state
  - Pages handle their own loading and error states
  - Keeps routing and page logic together
  
- **Feature components** (`CharacterCompatibilityGenerator.tsx`):
  - Complex features are extracted into separate components
  - Can be reused across pages if needed
  - Maintains separation of concerns
  
- **Minimal abstraction**:
  - No unnecessary component hierarchies or abstractions
  - Components are straightforward and easy to understand
  - Easier to maintain and modify

### Routing Strategy

**Decision: React Router with simple route structure**

**Rationale:**
- **Client-side routing**: 
  - Fast navigation without full page reloads
  - Maintains application state during navigation
  - Better user experience for a single-page application
  
- **Simple route structure**:
  - `/` - Home page (locations and search)
  - `/location/:id` - Location detail page
  - `/character/:id` - Character detail page
  - Clear, RESTful URL structure
  
- **No nested routes**: 
  - Simple structure is easier to maintain
  - No need for complex route hierarchies for this application

### Search Implementation

**Decision: Debounced autosuggest with semantic search**

**Rationale:**
- **Debouncing** (300ms delay):
  - Reduces API calls while user is typing
  - Improves performance and reduces backend load
  - Better user experience (no flickering results)
  
- **Autosuggest dropdown**:
  - Shows search results as user types
  - Displays character images and location names for quick recognition
  - Limits to 8 results for performance and UI clarity
  
- **Semantic search via backend**:
  - Uses vector embeddings for meaning-based search
  - More powerful than simple text matching
  - Handles queries like "scientist" or "dangerous place" effectively

### Configuration Management

**Decision: Centralized config module**

**Rationale:**
- **Single source of truth** (`src/lib/config.ts`):
  - All environment variables accessed through one module
  - Type-safe configuration with TypeScript
  - Easy to update and maintain
  
- **Environment variable handling**:
  - Vite requires `VITE_` prefix for browser exposure
  - Config module provides defaults if env vars not set
  - Clear separation between dev and prod configuration

### Styling Approach

**Decision: Tailwind CSS utility classes**

**Rationale:**
- **Utility-first CSS**:
  - Fast development with utility classes
  - No need to write custom CSS for most components
  - Consistent design system
  
- **Responsive design**:
  - Tailwind's responsive utilities make mobile-first design easy
  - Breakpoints are consistent across the application
  
- **No CSS-in-JS**:
  - Simpler build process
  - Better performance (no runtime CSS generation)
  - Easier to debug in browser DevTools

### TypeScript Usage

**Decision: Full TypeScript for type safety**

**Rationale:**
- **Type safety**:
  - Catches errors at compile time
  - Better IDE autocomplete and IntelliSense
  - Self-documenting code with type annotations
  
- **Interface definitions**:
  - Clear contracts for data structures (SearchResult, Note, etc.)
  - Prevents runtime errors from incorrect data shapes
  - Makes refactoring safer

### Technology Stack Choices

- **React 18**: Modern React with hooks, concurrent features
- **Vite**: Fast build tool and dev server with HMR
- **TypeScript**: Type safety and better developer experience
- **Apollo Client**: Best-in-class GraphQL client with caching
- **React Router**: Industry-standard routing solution
- **Tailwind CSS**: Rapid UI development with utility classes