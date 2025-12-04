/**
 * Frontend configuration
 * Centralized configuration management for the application
 */

export const config = {
  // Backend API URL
  backendUrl: import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001',
  
  // GraphQL API URL (Rick and Morty API)
  graphqlUrl: import.meta.env.VITE_GRAPHQL_URL || 'https://rickandmortyapi.com/graphql',
  
  // Environment
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
} as const;

