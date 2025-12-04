# Rick & Morty Universe Explorer

A modern web application to explore the Rick & Morty universe using the Rick & Morty GraphQL API.

## Features

- **Locations Page**: Browse all locations in the Rick & Morty universe with pagination
- **Total Character Count**: See the total number of characters across all locations
- **Location Details**: View all residents of a specific location with pagination
- **Character Details**: Deep dive into individual character information including:
  - Status, species, type, gender
  - Origin and current location
  - Episode appearances
  - Character images

## Tech Stack

- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Apollo Client**: GraphQL client for data fetching
- **Tailwind CSS**: Modern, responsive styling
- **Rick & Morty GraphQL API**: https://rickandmortyapi.com/graphql

## Why GraphQL?

I chose GraphQL over REST for this project because:

1. **Flexibility**: GraphQL allows fetching exactly the data needed in a single query, reducing over-fetching
2. **Query Efficiency**: Can fetch nested relationships (like location with residents) in one request
3. **Developer Ergonomics**: Strong typing and introspection make development faster
4. **Future-proof**: Easy to extend queries as new features are added

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
rickandmorty/
├── app/
│   ├── layout.tsx          # Root layout with Apollo provider
│   ├── page.tsx            # Locations listing page
│   ├── location/[id]/      # Location detail page
│   └── character/[id]/     # Character detail page
├── components/
│   └── ApolloWrapper.tsx   # Apollo Client provider wrapper
├── lib/
│   ├── apollo-client.ts    # Apollo Client configuration
│   └── graphql/
│       └── queries.ts      # GraphQL queries
└── ...
```

## Features Implementation

### Locations Page
- Displays all locations with pagination
- Shows total character count across all displayed locations
- Each location card shows type, dimension, and resident count
- Click on a location to view its residents

### Location Detail Page
- Shows location information (name, type, dimension)
- Lists all residents with pagination (12 per page)
- Each resident card shows image, name, status, species, and gender
- Click on a resident to view full character details

### Character Detail Page
- Complete character information
- Large character image
- Status, species, type, gender
- Origin and current location details
- List of episodes the character appeared in

## UI/UX Features

- Modern gradient background with Rick & Morty color scheme
- Responsive design (mobile, tablet, desktop)
- Smooth hover animations and transitions
- Glassmorphism effects with backdrop blur
- Color-coded status indicators (Alive = green, Dead = red)
- Intuitive navigation with back buttons

