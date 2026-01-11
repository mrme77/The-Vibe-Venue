# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Date Night & Event Planner** is an AI-powered web application that generates personalized venue recommendations for social gatherings, date nights, and team events. The app provides intelligent suggestions with visual maps, customer reviews, and detailed AI reasoning to help users plan memorable occasions.

**Core Principle**: Privacy-first, stateless architecture with zero data retention.

## Technology Stack

- **Frontend**: Next.js, TypeScript, React, Tailwind CSS
- **Backend**: Next.js API Routes (serverless)
- **AI**: OpenRouter (Gemini or GPT models)
- **APIs**: Google Places API, Google Maps JavaScript API, Google Geocoding API
- **PDF Generation**: jsPDF
- **Hosting**: Vercel
- **Package Manager**: npm
- **Code Quality**: ESLint + Prettier

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
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
GOOGLE_PLACES_API_KEY=your_google_places_api_key
```

See `.env.example` for a template. All API keys must be stored in Vercel environment variables for production deployment.

## Architecture Overview

### Application Flow

1. **User Input** → User fills out planning form (location, occasion, preferences, budget, etc.)
2. **Geocoding** → Convert location (city/zip) to coordinates via Google Geocoding API
3. **AI Search Query Generation** → AI generates appropriate venue search queries based on occasion and preferences
4. **Venue Search** → Google Places API searches for venues within specified radius
5. **Venue Details** → Fetch detailed information (reviews, ratings, photos, hours) for each venue
6. **AI Analysis** → AI analyzes venues against user context and generates personalized recommendations with reasoning
7. **Results Display** → Show top recommendations with map, reviews, and export options

### API Routes

- **`/api/geocode`**: Converts user-provided location (city or zip code) to lat/lng coordinates
- **`/api/search-venues`**: AI generates search queries → queries Google Places API → returns venue results
- **`/api/recommendations`**: Takes venue data + user preferences → AI generates personalized recommendations with reasoning

### Component Structure

```
/pages
  /api
    geocode.ts          # Location to coordinates
    search-venues.ts    # AI-driven venue search
    recommendations.ts  # AI venue analysis and recommendations
  index.tsx             # Main page orchestrating the flow

/components
  PlanningForm.tsx      # User input form (location, occasion, preferences)
  VenueCard.tsx         # Individual venue display with reviews, photos, ratings
  MapView.tsx           # Google Maps integration showing venue markers
  ExportButtons.tsx     # PDF download and copy-to-clipboard functionality

/lib
  google-places.ts      # Google Places API client and helpers
  openrouter.ts         # OpenRouter AI client
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

### Google APIs Usage

**Places API**:
- Text search for venues within user-specified radius
- Fetch place details (reviews, ratings, photos, opening hours, price level)

**Geocoding API**:
- Convert city name or zip code to latitude/longitude coordinates

**Maps JavaScript API**:
- Display interactive map with venue markers
- Allow users to visualize venue locations relative to their starting point

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

### Cost Efficiency
- Keep API usage minimal to stay within Vercel free tier
- Optimize Google Places API calls (batch requests where possible)
- Use efficient AI models (Gemini or GPT via OpenRouter)

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
2. Modify Google Places API call in `/lib/google-places.ts` to fetch the new field
3. Update `VenueCard` component to display it
4. If relevant, include in AI prompt for better recommendations
5. Add to PDF generation if important for printed plans

### Modifying AI Recommendation Logic
1. Update the prompt in `/pages/api/recommendations.ts`
2. Test with various occasions and preferences
3. Ensure AI responses are structured consistently
4. Verify PDF export includes new reasoning

### Changing Search Radius or Result Count
- Search parameters are defined in user form and passed to `/api/search-venues`
- Adjust validation in `PlanningForm.tsx`
- Update Google Places API query parameters in `/lib/google-places.ts`

## Notes

- This project is designed to be a portfolio piece showcasing AI integration, API orchestration, and modern web development
- Maintain the privacy-first philosophy in all feature additions
- The app should feel fast and frictionless for users
- Export options (PDF, clipboard) are key features for shareability
