# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Date Night & Event Planner** is an AI-powered web application that generates personalized venue recommendations for social gatherings, date nights, and team events. The app provides intelligent suggestions with visual maps, customer reviews, and detailed AI reasoning to help users plan memorable occasions.

**Core Principle**: Privacy-first, stateless architecture with zero data retention.

## Technology Stack

- **Frontend**: Next.js, TypeScript, React, Tailwind CSS
- **Backend**: Next.js API Routes (serverless)
- **AI**: OpenRouter (free Gemini models)
- **Free APIs**:
  - **Nominatim (OSM)**: Geocoding - 100% free, no API key
  - **Overpass API (OSM)**: Venue data - 100% free, no API key
  - **Yelp Fusion API**: Reviews & ratings - 500 requests/day free
  - **Leaflet.js**: Interactive maps - 100% free, open-source
- **PDF Generation**: jsPDF
- **Hosting**: Vercel
- **Package Manager**: npm
- **Code Quality**: ESLint + Prettier

**Cost Optimization**: This project uses 100% free APIs to eliminate costs and maximize accessibility.

## Quick Start

```bash
# Install dependencies
npm install

# Start development server (http://localhost:3000)
npm run dev

# Build for production
npm run build

# Run production build locally
npm run start

# Lint code
npm run lint

# Format code (if Prettier script is configured)
npm run format
```

## Environment Setup

Create a `.env.local` file in the root directory with the following API keys:

```
OPENROUTER_API_KEY=your_openrouter_api_key
YELP_API_KEY=your_yelp_api_key
```

**API Key Sources**:
- **OpenRouter**: https://openrouter.ai/keys (free tier with Gemini models)
- **Yelp Fusion API**: https://www.yelp.com/developers/v3/manage_app (500 requests/day free)
- **Nominatim & Overpass**: No API keys required (100% free OSM services)

See `.env.example` for a template. All API keys must be stored in Vercel environment variables for production deployment.

## Architecture Overview

### Application Flow

1. **User Input** → User fills out planning form (location, occasion, preferences, budget, etc.)
2. **Geocoding** → Convert location (city/zip) to coordinates via Nominatim (OSM)
3. **AI Search Query Generation** → OpenRouter AI generates appropriate venue search queries
4. **Venue Search** → Overpass API searches OSM for venues within specified radius
5. **Venue Enrichment** → Yelp Fusion API adds reviews, ratings, photos, and price level
6. **AI Analysis** → OpenRouter AI analyzes venues and generates personalized recommendations
7. **Results Display** → Show top recommendations with Leaflet map, reviews, and export options

### API Routes

- **`/api/geocode`**: Converts user-provided location to lat/lng via Nominatim (OSM)
- **`/api/search-venues`**: AI generates search queries → Overpass API finds venues → Yelp enriches data
- **`/api/recommendations`**: AI analyzes venues against user preferences → returns ranked recommendations

### Component Structure

```
/pages
  /api
    geocode.ts          # Nominatim geocoding
    search-venues.ts    # AI + Overpass + Yelp venue search
    recommendations.ts  # AI venue analysis and recommendations
  index.tsx             # Main page orchestrating the flow

/components
  PlanningForm.tsx      # User input form (location, occasion, preferences)
  VenueCard.tsx         # Individual venue display with reviews, photos, ratings
  MapView.tsx           # Leaflet.js map integration showing venue markers
  ExportButtons.tsx     # PDF download and copy-to-clipboard functionality

/lib
  nominatim.ts          # Nominatim (OSM) geocoding client
  overpass.ts           # Overpass API (OSM) venue search client
  yelp.ts               # Yelp Fusion API client for reviews/ratings
  openrouter.ts         # OpenRouter AI client
  utils.ts              # Helper functions (rate limiting, matching, etc.)
  pdf-generator.ts      # jsPDF logic for generating downloadable plans

/types
  venue.ts              # Venue data types (name, address, rating, reviews, etc.)
  user-preferences.ts   # User input types (occasion, budget, preferences, etc.)
```

## Key Implementation Patterns

### AI Integration

**AI-First Search Strategy**: The AI generates dynamic search queries based on the occasion and user preferences, rather than using predefined mappings. For example:
- "romantic date night" → AI might query for "upscale restaurants", "wine bars", "rooftop dining"
- "team outing" → AI might query for "group-friendly restaurants", "breweries", "event spaces"

**AI Recommendation Generation**: After venues are found, AI analyzes them against:
- User occasion context
- Dietary restrictions
- Budget preferences
- Desired atmosphere/vibe
- Group size considerations

The AI provides personalized reasoning for each recommendation.

### Free APIs Usage

**Nominatim (OpenStreetMap)**:
- Convert city name or zip code to latitude/longitude coordinates
- 100% free, no API key required
- Rate limit: 1 request/second (must implement throttling)
- Requires User-Agent header in all requests

**Overpass API (OpenStreetMap)**:
- Query OSM for venues (restaurants, bars, cafes, etc.) within radius
- 100% free, no API key required
- Returns amenity data with names, locations, and tags
- Use Overpass QL query language

**Yelp Fusion API**:
- Enrich OSM venues with reviews, ratings, photos, and price levels
- Free tier: 500 requests/day
- Match venues by name and location (fuzzy matching)
- Provides highest quality review and rating data

**Leaflet.js**:
- Display interactive map with venue markers and popups
- 100% free, open-source JavaScript library
- Uses OpenStreetMap tiles (no API key required)
- Must include OSM attribution

### PDF Export

Use jsPDF to generate downloadable event plans including:
- Top venue recommendations with AI reasoning
- Venue details (address, rating, price level)
- Customer reviews
- Cost estimates
- Pro tips (parking, reservations, etc.)
- Backup venue options

Keep the layout clean and printable.

### Privacy & Statelessness

**Critical Design Principle**: This application is completely stateless.

- **No database**: Do not suggest adding a database or any form of persistent storage for user data
- **No user accounts**: No authentication, no user profiles
- **No data retention**: All processing happens in API routes, results are returned immediately and not stored
- **No history**: Do not implement features that save or recall past searches
- **API keys only in environment variables**: Never hardcode API keys

The only acceptable analytics are basic visitor counts (if implemented).

## Development Guidelines

### Cost Efficiency & Rate Limiting
- **Zero Cost Goal**: All APIs are free - stay within free tier limits
- **Nominatim**: Implement 1 req/sec throttling (usage policy requirement)
- **Yelp**: Track daily usage, graceful degradation after 500 requests/day
- **Overpass**: Batch queries, avoid rapid-fire requests, cache results
- **OpenRouter**: Use free Gemini models, efficient prompts, cache AI responses
- **Vercel**: Optimize to stay within free tier (serverless function limits)

### Code Style
- Follow ESLint and Prettier configurations
- Use TypeScript for type safety
- Write clean, self-documenting code
- Component-based architecture (React best practices)

### Mobile Responsiveness
- All components must be mobile-responsive (Tailwind CSS)
- Form should be easy to use on mobile devices
- Map should work well on smaller screens

## Common Tasks

### Adding a New Venue Attribute
1. Update the `Venue` type in `/types/venue.ts`
2. Check if data is available in Overpass API (OSM tags) or Yelp API
3. Modify `/lib/overpass.ts` or `/lib/yelp.ts` to fetch the new field
4. Update `VenueCard` component to display it
5. If relevant, include in AI prompt for better recommendations
6. Add to PDF generation if important for printed plans

### Modifying AI Recommendation Logic
1. Update the prompt in `/pages/api/recommendations.ts`
2. Test with various occasions and preferences
3. Ensure AI responses are structured consistently
4. Verify PDF export includes new reasoning

### Changing Search Radius or Result Count
- Search parameters are defined in user form and passed to `/api/search-venues`
- Adjust validation in `PlanningForm.tsx`
- Update Overpass API query parameters in `/lib/overpass.ts` (radius in meters)

### Handling API Rate Limits
- Nominatim: Implement 1 req/sec delay in `/lib/nominatim.ts`
- Yelp: Track requests, show user-friendly message at 500/day limit
- Overpass: Batch queries, implement caching for repeated searches
- Add retry logic with exponential backoff for transient errors

## Notes

- This project is designed to be a portfolio piece showcasing AI integration, API orchestration, and modern web development
- Maintain the privacy-first philosophy in all feature additions
- The app should feel fast and frictionless for users
- Export options (PDF, clipboard) are key features for shareability
