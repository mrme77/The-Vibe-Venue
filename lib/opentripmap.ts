/**
 * OpenTripMap Client
 * Used to get "Popularity" data and POI details.
 * Requires API Key (Free tier available at https://opentripmap.io/product).
 * Optional: App works fine without it, just won't have OpenTripMap venue enrichment.
 */

const OTM_API_KEY = process.env.OPENTRIPMAP_API_KEY;

interface OTMResponse {
  rate: number; // 1-3 popularity
  kinds: string;
  name: string;
  wikipedia_extracts?: {
    text: string;
  };
  preview?: {
    source: string; // Image URL
  };
}

/**
 * Get details from OpenTripMap
 * Useful for "Popularity" (rate) and additional descriptions
 */
export async function getOpenTripMapDetails(
  name: string,
  lat: number,
  lng: number
): Promise<{ rate: number; image?: string; text?: string } | null> {
  // Skip if no API key configured (optional feature)
  if (!OTM_API_KEY) {
    return null;
  }

  // First, we need to find the OTM xid (ID) by location/name
  // radius=100m approx 0.001 deg.
  const searchUrl = `https://api.opentripmap.com/0.1/en/places/radius?radius=200&lon=${lng}&lat=${lat}&name=${encodeURIComponent(name)}&apikey=${OTM_API_KEY}&limit=1`;

  try {
    const searchRes = await fetch(searchUrl);
    if (!searchRes.ok) return null;
    
    const features = await searchRes.json();
    if (!features.features || features.features.length === 0) return null;
    
    const xid = features.features[0].properties.xid;
    
    // Now get details
    const detailsUrl = `https://api.opentripmap.com/0.1/en/places/xid/${xid}?apikey=${OTM_API_KEY}`;
    const detailsRes = await fetch(detailsUrl);
    if (!detailsRes.ok) return null;
    
    const details: OTMResponse = await detailsRes.json();
    
    return {
      rate: details.rate || 0,
      image: details.preview?.source,
      text: details.wikipedia_extracts?.text
    };

  } catch (error) {
    console.warn('OTM fetch error:', error);
    return null;
  }
}
