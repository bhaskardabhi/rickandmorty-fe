# React Migration Guide

The application has been converted from Next.js to React with Vite.

## What Changed

### Build Tool
- **Before**: Next.js
- **After**: Vite (faster builds and HMR)

### Routing
- **Before**: Next.js App Router (`/app` directory)
- **After**: React Router (`react-router-dom`)

### File Structure
- **Before**: `app/` directory with Next.js conventions
- **After**: `src/` directory with standard React structure

### Environment Variables
- **Before**: `NEXT_PUBLIC_*` prefix
- **After**: `VITE_*` prefix

### Image Handling
- **Before**: Next.js `Image` component
- **After**: Standard HTML `<img>` tag

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create environment file:**
   ```bash
   cp .env.example .env.local
   ```

3. **Update `.env.local` with your backend URL:**
   ```bash
   VITE_BACKEND_URL=http://localhost:3001
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

5. **Build for production:**
   ```bash
   npm run build
   ```

## Project Structure

```
src/
├── pages/
│   ├── Home.tsx           # Main locations page
│   ├── LocationPage.tsx   # Location details with description
│   └── CharacterPage.tsx  # Character details
├── lib/
│   ├── apollo-client.ts   # Apollo Client setup
│   ├── config.ts          # Configuration
│   └── graphql/
│       └── queries.ts     # GraphQL queries
├── App.tsx                # Main app with routing
├── main.tsx               # Entry point
└── index.css              # Global styles
```

## Key Differences from Next.js

1. **Routing**: Use `react-router-dom` instead of Next.js routing
   ```tsx
   import { Link, useNavigate, useParams } from 'react-router-dom';
   ```

2. **Navigation**: Use `navigate(-1)` instead of `router.back()`

3. **Images**: Use standard `<img>` instead of Next.js `Image` component

4. **Environment Variables**: Use `import.meta.env.VITE_*` instead of `process.env.NEXT_PUBLIC_*`

5. **Config**: Updated to use Vite's env system

## Benefits

- ✅ Faster development with Vite's HMR
- ✅ Smaller bundle size
- ✅ Standard React patterns
- ✅ More flexible routing
- ✅ Better tree-shaking

## Migration Notes

- All pages converted to React components
- Apollo Client setup maintained
- Tailwind CSS configuration updated
- All functionality preserved

