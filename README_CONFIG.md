# Frontend Configuration

## Configuration Storage

The frontend application stores configuration in the following places:

### 1. Environment Variables (`.env.local`)

Vite uses environment variables for configuration. Create a `.env.local` file in the root of the frontend project:

```bash
# Backend API URL
VITE_BACKEND_URL=http://localhost:3001

# GraphQL API URL (optional, defaults to Rick and Morty API)
VITE_GRAPHQL_URL=https://rickandmortyapi.com/graphql
```

**Important Notes:**
- Only variables prefixed with `VITE_` are exposed to the browser
- `.env.local` is gitignored and should not be committed
- Use `.env.example` as a template (see below)

### 2. Centralized Config File (`src/lib/config.ts`)

All configuration is centralized in `src/lib/config.ts` for easy access:

```typescript
import { config } from '@/lib/config';

// Use config values
const backendUrl = config.backendUrl;
```

This provides:
- Type safety
- Single source of truth
- Easy to update and maintain
- Default values if env vars are not set

### 3. Vite Config (`vite.config.ts`)

Vite-specific settings are in `vite.config.ts`:
- Path aliases
- Server configuration
- Build settings

## Setup

1. **Create `.env.local` file:**
   ```bash
   cp .env.example .env.local
   ```

2. **Update values in `.env.local`:**
   ```bash
   VITE_BACKEND_URL=http://localhost:3001
   ```

3. **Restart the dev server** after changing environment variables:
   ```bash
   npm run dev
   ```

## Available Configuration

| Variable | Default | Description |
|---------|---------|-------------|
| `VITE_BACKEND_URL` | `http://localhost:3001` | Backend API server URL |
| `VITE_GRAPHQL_URL` | `https://rickandmortyapi.com/graphql` | GraphQL API endpoint |

## Usage in Code

Instead of using `process.env` directly, use the centralized config:

```typescript
// ❌ Don't do this
const url = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

// ✅ Do this
import { config } from '@/lib/config';
const url = config.backendUrl;
```

## Environment-Specific Configuration

- **Development**: Use `.env.local` (gitignored)
- **Production**: Set environment variables in your hosting platform (Vercel, Netlify, etc.)

## Note

This app uses **Vite** (not Next.js). Environment variables must be prefixed with `VITE_` to be exposed to the browser.

