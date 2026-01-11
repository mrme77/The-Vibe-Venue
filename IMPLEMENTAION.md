# IMPLEMENTATION.md

## Goal
Build the Date Night & Event Planner MVP as described in CLAUDE.md

**Experience Level**: Beginner-friendly with detailed guidance
**Plan Style**: Granular tasks (15-30 min each)
**Skills Available**: frontend-developer, backend-architect, prompt-engineer, ui-ux-designer

---

## Phase 1: Project Foundation & Setup
**Goal**: Initialize Next.js project with TypeScript and Tailwind CSS

### 1.1 Project Initialization
- [ ] Run `npx create-next-app@latest` with TypeScript and Tailwind options
  - Choose: TypeScript: Yes, ESLint: Yes, Tailwind CSS: Yes, App Router: No (use Pages Router)
  - Choose: src/ directory: No, import alias: Yes (@/*)
- [ ] Verify project structure created correctly
- [ ] Test dev server runs (`npm run dev`) and loads at localhost:3000
- [ ] Delete default boilerplate files (pages/api/hello.ts, default styles)

### 1.2 Environment Setup
- [ ] Create `.env.local` file in root directory
- [ ] Copy contents from `.env.example` (or create template)
- [ ] Add placeholder keys for:
  ```
  OPENROUTER_API_KEY=your_key_here
  YELP_API_KEY=your_key_here
  ```
- [ ] Add `.env.local` to `.gitignore` (verify it's already there)
- [ ] Document where to obtain each API key:
  - OpenRouter: https://openrouter.ai/keys (use free Gemini model)
  - Yelp Fusion API: https://www.yelp.com/developers/v3/manage_app (500 requests/day free)
  - Nominatim: No API key required (free OSM geocoding)
  - Overpass API: No API key required (free OSM venue data)

### 1.3 Directory Structure
- [ ] Create `/types` directory in root
- [ ] Create `/lib` directory in root
- [ ] Create `/components` directory in root
- [ ] Create `/pages/api` directory (should already exist)
- [ ] Verify folder structure matches CLAUDE.md architecture

### 1.4 Dependencies Installation
- [ ] Install jsPDF: `npm install jspdf`
- [ ] Install Leaflet for maps: `npm install leaflet` and `npm install -D @types/leaflet`
- [ ] Install axios for API calls: `npm install axios`
- [ ] Verify all dependencies installed: `npm list --depth=0`
- [ ] Run `npm run build` to test build works

### 1.5 Code Quality Tools
- [ ] Review `.eslintrc.json` configuration
- [ ] Create `.prettierrc` file with basic config:
  ```json
  {
    "semi": true,
    "trailingComma": "es5",
    "singleQuote": true,
    "tabWidth": 2,
    "printWidth": 80
  }
  ```
- [ ] Add format script to package.json: `"format": "prettier --write ."`
- [ ] Test linting: `npm run lint`

---

## Phase 2: Type Definitions & Data Models
**Goal**: Define TypeScript types for venues and user preferences
**Skill**: `backend-architect` for data modeling

### 2.1 Venue Type Definition
- [ ] Create `/types/venue.ts` file
- [ ] Define `Venue` interface with fields:
  - name: string
  - address: string
  - rating: number
  - priceLevel: number (1-4)
  - photos: string[] (photo URLs)
  - reviews: Review[]
  - openingHours?: string[]
  - placeId: string
  - location: { lat: number; lng: number }
- [ ] Define `Review` interface:
  - author: string
  - rating: number
  - text: string
  - time: number
- [ ] Add JSDoc comments explaining each field
- [ ] Export all types

### 2.2 User Preferences Type Definition
- [ ] Create `/types/user-preferences.ts` file
- [ ] Define `UserPreferences` interface with fields:
  - occasion: string (e.g., "date night", "team outing")
  - location: string (city or zip code)
  - radius: number (search radius in meters)
  - budget: 'low' | 'medium' | 'high' | 'any'
  - dietaryRestrictions?: string[]
  - atmosphere?: string (e.g., "romantic", "casual", "upscale")
  - groupSize?: number
  - additionalPreferences?: string
- [ ] Add JSDoc comments with examples
- [ ] Export all types

### 2.3 API Response Types
- [ ] In `/types/venue.ts`, add `VenueSearchResponse` type:
  - venues: Venue[]
  - searchQueries: string[] (AI-generated queries used)
- [ ] Add `RecommendationResponse` type:
  - recommendations: RecommendedVenue[]
- [ ] Define `RecommendedVenue` extending `Venue`:
  - aiReasoning: string
  - matchScore: number (0-100)
  - pros: string[]
  - cons: string[]
- [ ] Export all types

---

## Phase 3: Backend Utilities & API Clients
**Goal**: Set up API clients for OpenRouter, Nominatim (OSM), Overpass API, OpenTripMap, and WikiData
**Skill**: `backend-architect` for API design, `prompt-engineer` for AI prompts

### 3.1 OpenRouter Client Setup
- [x] Create `/lib/openrouter.ts` file
- [x] Create `callOpenRouter` async function:
  - Parameters: prompt (string), model (string, default 'google/gemini-2.0-flash-exp:free')
  - Use fetch to call OpenRouter API (https://openrouter.ai/api/v1/chat/completions)
  - Add proper error handling with try/catch
  - Return parsed JSON response
  - **Fixed: Use string format for content (not array) for text-only messages**
- [x] Add TypeScript types for OpenRouter request/response
- [x] Test function with a simple prompt (console.log test)
- [x] Add JSDoc documentation
- [x] **Fixed invalid model ID (was causing 400 errors)**

### 3.2 Nominatim Client - Geocoding (Free OSM)
- [x] Create `/lib/nominatim.ts` file
- [x] Create `geocodeLocation` async function:
  - Parameter: locationString (string)
  - Call Nominatim API: https://nominatim.openstreetmap.org/search
  - Add User-Agent header (required by Nominatim)
  - Return { lat: number, lng: number } or throw error
  - Add error handling for invalid locations
  - Implement 1 request/second rate limiting (Nominatim requirement)
- [x] Add TypeScript return type
- [x] Add JSDoc documentation with usage policy notes

### 3.3 Overpass API Client - Venue Search (Free OSM)
- [x] Create `/lib/overpass.ts` file
- [x] Create `searchVenues` async function:
  - Parameters: query (string), location ({ lat, lng }), radius (number in meters)
  - Build Overpass QL query for amenities (restaurants, bars, cafes, etc.)
  - Call Overpass API: https://overpass-api.de/api/interpreter
  - Parse OSM data and extract venue information
  - Return array of basic venue data (name, location, tags, wikidata_id)
- [x] Create helper to map OSM amenity types to our search terms
- [x] Add rate limiting (avoid overwhelming free API)
- [x] Add JSDoc documentation

### 3.4 WikiData & Wikimedia Client - Info & Images
- [x] Create `/lib/wikidata.ts` file
- [x] Create `getWikiDataDetails` async function:
  - Parameter: wikidataId (string)
  - Call WikiData API to fetch label, description, and P18 (image) claim
  - Return { description: string, imageUrl: string }
- [x] Create `resolveWikimediaUrl` helper:
  - Convert Wikimedia filename to actual URL
- [x] Add JSDoc documentation

### 3.5 OpenTripMap Client - Popularity & Details
- [x] Create `/lib/opentripmap.ts` file
- [x] Create `getPlaceDetails` async function:
  - Parameters: name, lat, lng
  - Call OpenTripMap API to fuzzy match place
  - Return { rate: number (1-3 stars based on popularity), kinds: string }
- [x] Add JSDoc documentation

### 3.6 Helper Functions
- [x] Create `/lib/utils.ts` for shared utilities
- [x] Add `formatAddress` function (clean up address strings)
- [x] Add `getPriceLabel` function (convert 1-4 to $ symbols)
- [x] Add `calculateDistance` function (haversine formula for lat/lng)
- [x] Add `rateLimiter` utility (for API throttling)
- [x] Add `matchVenuesByLocation` (fuzzy matching)
- [x] Export all utilities

---

## Phase 4: API Routes - Backend Logic
**Goal**: Build three API endpoints for geocoding, venue search, and recommendations
**Skill**: `backend-architect` for API structure, `prompt-engineer` for AI prompts

### 4.1 Geocode API Route
- [x] Create `/pages/api/geocode.ts` file
- [x] Set up POST request handler with TypeScript (NextApiRequest, NextApiResponse)
- [x] Validate request body has `location` field
- [x] Call `geocodeLocation` from lib/nominatim.ts
- [x] Return { lat, lng } as JSON
- [x] Add error responses
- [x] Add CORS headers if needed
- [x] Test with Postman or curl

### 4.2 Search Venues API Route - Part 1: AI Query Generation
**Skill**: `prompt-engineer` for creating search query prompt
- [x] Create `/pages/api/search-venues.ts` file
- [x] Set up POST request handler
- [x] Validate request body has: occasion, preferences, location, radius
- [x] Create AI prompt for generating search queries:
  - Input: occasion type, preferences, dietary restrictions
  - Output: 3-5 specific search query strings
  - **Enhanced: Added full user context (dietary, atmosphere, additional prefs)**
  - **Enhanced: Added OSM amenity type examples for better AI guidance**
- [x] Call OpenRouter with the prompt
- [x] Parse AI response to extract search queries array
- [x] Add error handling for AI failures with fallback queries

### 4.3 Search Venues API Route - Part 2: Venue Fetching
- [x] Loop through AI-generated search queries
- [x] Call Overpass API `searchVenues` for each query
- [x] Extract `wikidata` IDs from OSM results
- [x] Fetch details from WikiData (images, descriptions) for items with IDs
- [x] (Optional) Fetch popularity from OpenTripMap
- [x] Combine results into `Venue` objects
- [x] Limit to top 10-15 venues to control API usage
- [x] Return { venues, searchQueries } as JSON
- [x] Add error handling
- [x] Test endpoint with sample request

### 4.4 Recommendations API Route - Part 1: AI Prompt Design
**Skill**: `prompt-engineer` for recommendation prompt
- [x] Create `/pages/api/recommendations.ts` file
- [x] Set up POST request handler
- [x] Validate request body has: venues[], userPreferences
- [x] Design AI prompt for venue analysis:
  - Input: venue data (name, description, tags), user context
  - Output: JSON array of recommendations with reasoning
  - Include: matchScore, pros, cons, aiReasoning for each venue
  - **Enhanced: Added structured scoring guidance (90-100=perfect, 70-89=great, etc.)**
  - **Enhanced: Emphasized occasion-specific reasoning and concrete examples**
- [x] Structure prompt with clear output format (JSON schema)

### 4.5 Recommendations API Route - Part 2: Processing
- [x] Call OpenRouter with venues + user preferences
- [x] Parse AI response to extract recommendations array
- [x] Validate AI output has required fields
- [x] Sort recommendations by matchScore (descending)
- [x] Return top 5 recommendations as JSON
- [x] Add fallback if AI response is malformed
- [x] Add error handling
- [x] Test endpoint with sample venues and preferences

---

## Phase 5: UI Components - User Interface
**Goal**: Build reusable React components with Tailwind CSS
**Skill**: `frontend-developer` for React components, `ui-ux-designer` for user experience

### 5.1 Planning Form Component - Structure
**Skill**: `ui-ux-designer` for form UX design
- [x] Create `/components/PlanningForm.tsx` file
- [x] Set up React component with TypeScript props interface
- [x] Plan form fields matching UserPreferences type:
  - Location input (text)
  - Occasion dropdown or text input
  - Budget radio buttons (low/medium/high/any)
  - Group size number input
  - Dietary restrictions multi-select or textarea
  - Atmosphere/vibe dropdown
  - Additional preferences textarea
  - Search radius slider (1-25 miles)
- [x] Create initial component structure with form element

### 5.2 Planning Form Component - Implementation
**Skill**: `frontend-developer` for React forms
- [x] Add useState hooks for all form fields
- [x] Create controlled inputs for each field
- [x] Add Tailwind CSS styling:
  - Mobile-first responsive design
  - Clear labels and placeholders
  - Consistent spacing and colors
  - Focus states for accessibility
- [x] Create handleSubmit function (preventDefault, validate, emit data)
- [x] Add form validation:
  - Required fields: location, occasion
  - Radius: 1-25 miles
  - Group size: positive integer
- [x] Display validation errors inline

### 5.3 Planning Form Component - Polish
- [x] Add loading state during form submission
- [x] Disable submit button while loading
- [x] Add helpful placeholder text and examples
- [x] Test on mobile viewport (Chrome DevTools)
- [x] Add ARIA labels for accessibility
- [x] Add keyboard navigation support (tab order)

### 5.4 Venue Card Component - Structure
**Skill**: `ui-ux-designer` for card design
- [x] Create `/components/VenueCard.tsx` file
- [x] Define props interface: venue (RecommendedVenue), index (number)
- [x] Plan card layout:
  - Venue photo (if available)
  - Name and rating (stars)
  - Price level ($-$$$$)
  - Address
  - AI reasoning section
  - Pros/cons badges
  - Customer reviews snippet
  - "View on Google Maps" link

### 5.5 Venue Card Component - Implementation
**Skill**: `frontend-developer` for React components
- [x] Implement card structure with JSX
- [x] Add Tailwind CSS styling:
  - Card with shadow and rounded corners
  - Responsive grid/flexbox layout
  - Image sizing and aspect ratio
  - Color-coded rating stars
  - Badge styles for pros/cons
- [x] Add Google Maps link (using placeId)
- [x] Display top 2-3 customer reviews
- [x] Add fallback for missing photos
- [x] Make card accessible (semantic HTML, ARIA)

### 5.6 Venue Card Component - Polish
- [x] Add hover effects (shadow, scale)
- [x] Test on mobile and desktop
- [x] Add loading skeleton state (optional)
- [x] Format price level ($ to $$$$)
- [x] Truncate long review text with "Read more"

### 5.7 Map View Component - Setup (Leaflet.js)
**Skill**: `frontend-developer` for Leaflet integration
- [x] Create `/components/MapView.tsx` file
- [x] Define props interface: venues (Venue[]), center ({ lat, lng })
- [x] Import Leaflet CSS in component or _app.tsx: `import 'leaflet/dist/leaflet.css'`
- [x] Import leaflet library
- [x] Set up useEffect to initialize Leaflet map (client-side only)
- [x] Create div ref for map container with ID
- [x] Add Tailwind CSS for map container sizing (min-height: 400px)

### 5.8 Map View Component - Implementation (Leaflet.js)
- [x] Initialize Leaflet map with center and zoom
- [x] Add OpenStreetMap tile layer (free): `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`
- [x] Add markers for each venue using L.marker()
- [x] Add popups showing venue name, rating on marker click
- [x] Fix default marker icon issue (Leaflet + Next.js)
- [x] Add custom marker colors for top picks (optional)
- [x] Handle map loading errors gracefully
- [x] Make map responsive (height adjusts on mobile)
- [x] Clean up map instance on unmount

### 5.9 Map View Component - Polish (Leaflet.js)
- [x] Fit map bounds to show all markers using L.featureGroup().getBounds()
- [x] Add loading state while map initializes
- [x] Test on mobile devices
- [x] Add zoom controls (default in Leaflet)
- [x] Ensure accessibility (keyboard navigation works)
- [x] Add attribution for OpenStreetMap (required)

### 5.10 Export Buttons Component
**Skill**: `frontend-developer` for export functionality
- [x] Create `/components/ExportButtons.tsx` file
- [x] Define props: recommendations (RecommendedVenue[]), userPreferences
- [x] Create two buttons: "Download PDF" and "Copy to Clipboard"
- [x] Style buttons with Tailwind (primary/secondary styles)
- [x] Add icon components or emojis (📄, 📋)

---

## Phase 6: PDF Generation
**Goal**: Create downloadable PDF plans using jsPDF
**Skill**: `frontend-developer` for PDF generation

### 6.1 PDF Generator - Setup
- [x] Create `/lib/pdf-generator.ts` file
- [x] Import jsPDF and set up basic document
- [x] Create `generatePDF` async function:
  - Parameters: recommendations, userPreferences
  - Return: PDF blob or trigger download
- [x] Test basic PDF creation (blank page)

---

## Phase 7: Main Page Integration
**Goal**: Wire all components together in the main page
**Skill**: `frontend-developer` for state management

### 7.1 Main Page - Setup
- [x] Open `/pages/index.tsx`
- [x] Import all components (PlanningForm, VenueCard, MapView, ExportButtons)
- [x] Set up page-level state with useState:
  - userPreferences (UserPreferences | null)
  - venues (Venue[] | null)
  - recommendations (RecommendedVenue[] | null)
  - loading (boolean)
  - error (string | null)
- [x] Create basic page layout with Tailwind CSS

### 7.2 Main Page - Application Flow
- [x] Create handleFormSubmit async function:
  1. Set loading to true
  2. Call /api/geocode with location
  3. Call /api/search-venues with preferences and coordinates
  4. Call /api/recommendations with venues and preferences
  5. Update state with results
  6. Set loading to false
  7. Scroll to results
- [x] Add error handling with try/catch
- [x] Display error messages to user

### 7.3 Main Page - Conditional Rendering
- [x] Show PlanningForm by default
- [x] Show loading spinner while fetching data
- [x] Show error message if any API fails
- [x] Show results section only when recommendations exist:
  - Map with venue markers
  - List of VenueCard components
  - ExportButtons component
- [x] Add "Plan Another Event" button to reset state

### 7.4 Main Page - Layout & Styling
**Skill**: `ui-ux-designer` for page layout
- [x] Create responsive two-column layout (form left, results right on desktop)
- [x] Stack vertically on mobile
- [x] Add hero section with app title and description
- [x] Style loading states (spinner or skeleton screens)
- [x] Add smooth scroll behavior
- [x] Ensure consistent spacing and alignment

### 7.5 Main Page - Polish
- [x] Add meta tags for SEO (title, description)
- [x] Add favicon
- [x] Test entire user flow end-to-end
- [x] Add animations (fade-in for results)
- [x] Test on multiple screen sizes
- [x] Verify accessibility (tab navigation, screen reader)

---

## Phase 8: Error Handling & Edge Cases
**Goal**: Robust error handling throughout the app

### 8.1 API Error Handling
- [ ] In each API route, add try/catch blocks
- [ ] Return consistent error response format:
  ```json
  { "error": "Error message", "code": "ERROR_CODE" }
  ```
- [ ] Log errors to console (or error tracking service)
- [ ] Handle specific error cases:
  - Invalid API keys (401)
  - Rate limits exceeded (429)
  - Location not found (404)
  - AI service unavailable (503)

### 8.2 Frontend Error Handling
- [ ] Create error boundary component (optional, for React errors)
- [ ] Display user-friendly error messages
- [ ] Add retry mechanism for failed API calls
- [ ] Handle edge cases:
  - No venues found
  - AI returns unexpected format
  - Google Maps fails to load
  - PDF generation fails

### 8.3 Input Validation
- [ ] Validate all form inputs before submission
- [ ] Sanitize user input (trim, lowercase where appropriate)
- [ ] Add regex validation for zip codes
- [ ] Prevent XSS with proper escaping
- [ ] Add character limits to text fields

### 8.4 Loading States
- [ ] Add loading spinner component
- [ ] Show loading states for:
  - Form submission
  - Map loading
  - PDF generation
  - API calls
- [ ] Disable interactive elements while loading
- [ ] Add progress indicators for multi-step processes

### 8.5 Empty States
- [ ] Design empty state for no venues found
- [ ] Add helpful message suggesting to adjust search criteria
- [ ] Show example occasions and preferences
- [ ] Style empty states with illustrations or icons

---

## Phase 9: Documentation & Code Quality
**Goal**: Ensure code is documented and maintainable

### 9.1 Code Documentation
- [ ] Add JSDoc comments to all functions
- [ ] Document complex logic with inline comments
- [ ] Add README.md usage instructions
- [ ] Document environment variables in .env.example
- [ ] Add code examples in component files

### 9.2 Code Quality Checks
- [ ] Run ESLint and fix all warnings: `npm run lint`
- [ ] Run Prettier to format all files: `npm run format`
- [ ] Remove console.logs and debug code
- [ ] Remove unused imports and variables
- [ ] Ensure TypeScript has no `any` types (or minimal)

### 9.3 Performance Optimization
- [ ] Add React.memo to heavy components (VenueCard)
- [ ] Lazy load Google Maps script
- [ ] Optimize images (use next/image if applicable)
- [ ] Minimize API calls (cache geocoding results if needed)
- [ ] Test page load performance (Lighthouse)

### 9.4 Accessibility Audit
- [ ] Run Lighthouse accessibility audit
- [ ] Ensure all images have alt text
- [ ] Verify keyboard navigation works
- [ ] Add ARIA labels where needed
- [ ] Test with screen reader (basic check)
- [ ] Ensure color contrast meets WCAG AA standards

---

## Phase 10: Deployment to Vercel
**Goal**: Deploy app to production on Vercel

### 10.1 Pre-Deployment Checklist
- [ ] Run `npm run build` locally and fix any errors
- [ ] Test production build locally: `npm run start`
- [ ] Verify all features work in production mode
- [ ] Update README.md with deployment instructions
- [ ] Ensure .gitignore excludes .env.local and node_modules

### 10.2 Vercel Setup
- [ ] Create Vercel account (if not already)
- [ ] Install Vercel CLI: `npm i -g vercel`
- [ ] Run `vercel` command in project directory
- [ ] Link project to Vercel dashboard
- [ ] Configure project settings:
  - Framework: Next.js
  - Build command: `npm run build`
  - Output directory: .next
  - Install command: `npm install`

### 10.3 Environment Variables
- [ ] Go to Vercel project settings → Environment Variables
- [ ] Add OPENROUTER_API_KEY (production value - use free Gemini model)
- [ ] Add YELP_API_KEY (production value - 500 requests/day free tier)
- [ ] Verify keys are valid and have proper permissions
- [ ] Set variables for Production, Preview, and Development environments
- [ ] Note: Nominatim and Overpass API require no API keys (100% free)

### 10.4 Deploy & Test
- [ ] Trigger deployment: `vercel --prod`
- [ ] Wait for build to complete
- [ ] Visit deployment URL
- [ ] Test full user flow in production:
  - Submit form
  - View recommendations
  - Check map loads
  - Download PDF
  - Copy to clipboard
- [ ] Check for console errors in browser
- [ ] Test on mobile device

### 10.5 Custom Domain (Optional)
- [ ] Purchase domain (if desired)
- [ ] Add custom domain in Vercel dashboard
- [ ] Configure DNS records
- [ ] Wait for SSL certificate provisioning
- [ ] Test app on custom domain

### 10.6 Monitoring & Maintenance
- [ ] Set up Vercel analytics (free tier)
- [ ] Monitor API usage (OpenRouter, Google APIs)
- [ ] Check for errors in Vercel logs
- [ ] Set up alerts for deployment failures
- [ ] Document deployment process in README.md

---

## Appendix: Free API Architecture

### API Stack Overview

**Cost Optimization**: This project uses 100% free APIs to eliminate costs and API key complexity.

**APIs Used**:
1. **Nominatim (OpenStreetMap)** - Geocoding
   - Free, no API key required
   - Rate limit: 1 request/second
   - Must include User-Agent header
   - Usage policy: https://operations.osmfoundation.org/policies/nominatim/

2. **Overpass API (OpenStreetMap)** - Venue data
   - Free, no API key required
   - Rate limit: Reasonable use (avoid heavy queries)
   - Returns amenity data (restaurants, bars, cafes)
   - Query language: Overpass QL

3. **Yelp Fusion API** - Reviews, ratings, photos
   - Free tier: 500 requests/day
   - Requires API key (free signup)
   - Provides reviews, ratings, price level, photos
   - Best data quality for US venues

4. **OpenRouter** - AI (search queries + recommendations)
   - Free tier available with Gemini models
   - Model: `google/gemini-2.0-flash-exp`
   - Requires API key (free signup)

5. **Leaflet.js** - Interactive maps
   - Free, open-source mapping library
   - Uses OpenStreetMap tiles (free)
   - No API key required
   - Must include OSM attribution

### Rate Limiting Strategy

- **Nominatim**: Implement 1 req/sec delay between calls
- **Overpass**: Batch queries, cache results, avoid rapid-fire requests
- **Yelp**: Track daily usage, implement graceful degradation at 500 req/day
- **OpenRouter**: Use efficient prompts, cache AI responses when possible

### Data Flow

1. User enters location → **Nominatim** geocodes to lat/lng
2. AI generates search queries → **OpenRouter** (Gemini)
3. Search for venues → **Overpass API** (OSM amenities)
4. Enrich with reviews/ratings → **Yelp Fusion API**
5. AI analyzes venues → **OpenRouter** (Gemini)
6. Display on map → **Leaflet.js** (OSM tiles)

---

## Appendix: Skill Usage Guide

### When to Use Each Skill

**frontend-developer**
- Building React components (PlanningForm, VenueCard, MapView)
- Tailwind CSS styling and responsive design
- State management and React hooks
- Leaflet.js map integration
- PDF generation and export features

**backend-architect**
- API route structure and design
- Type definitions and data modeling
- Free API integrations (Nominatim, Overpass, Yelp)
- Rate limiting and API throttling strategies
- Error handling patterns
- Service architecture decisions

**prompt-engineer**
- Creating AI prompts for search query generation
- Designing recommendation prompt with structured output
- Optimizing prompt for consistent AI responses
- Testing and iterating on prompt quality
- Ensuring JSON output parsing works reliably

**ui-ux-designer**
- Planning form UX and user flow
- Card layout and visual hierarchy
- Mobile responsiveness strategy
- Accessibility considerations
- Empty states and error messages
- Overall page layout and navigation

---

## Progress Tracking

Mark tasks as complete as you work through them. Update this section with:
- Current phase number
- Blockers or challenges encountered
- Next steps

**Current Status**: Ready to begin Phase 1
**Last Updated**: [Date]
**Notes**:

---

## Quick Reference Commands

```bash
# Development
npm run dev          # Start dev server on localhost:3000
npm run build        # Build for production
npm run start        # Run production build locally
npm run lint         # Run ESLint
npm run format       # Run Prettier

# Deployment
vercel               # Deploy to preview
vercel --prod        # Deploy to production
```

---

## Getting Help

If you get stuck on any task:
1. Ask Claude Code specific questions about the task
2. Reference CLAUDE.md for architecture guidance
3. Check Next.js docs: https://nextjs.org/docs
4. Check Tailwind docs: https://tailwindcss.com/docs
5. Invoke relevant skill (e.g., `/frontend-developer` for component help)

---

**Ready to start? Begin with Phase 1, Task 1.1!**
