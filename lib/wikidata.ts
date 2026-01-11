/**
 * WikiData & Wikimedia Commons Client
 * Used to fetch venue descriptions and images using WikiData IDs found in OSM.
 */

interface WikiDataEntity {
  id: string;
  labels?: { [lang: string]: { value: string } };
  descriptions?: { [lang: string]: { value: string } };
  claims?: {
    P18?: [{ // P18 is "image"
      mainsnak: {
        datavalue: {
          value: string; // The filename on Commons
        };
      };
    }];
  };
}

interface WikiDataResponse {
  entities: { [id: string]: WikiDataEntity };
}

/**
 * Converts a Wikimedia Commons filename to a usable URL
 * Uses the MD5 hash folder structure convention
 */
function resolveWikimediaUrl(filename: string, width: number = 600): string {
  // Spaces become underscores
  const safeFilename = filename.replace(/ /g, '_');
  
  // Use the special thumb endpoint which handles resizing/hashing for us
  // Format: https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Filename.jpg/600px-Filename.jpg
  // However, simpler is to just use the standard Commons URL structure but that requires MD5 hashing.
  // EASIER: Use the Special:Redirect service or the MediaWiki API. 
  // But for direct URL generation without another API call, we need the MD5 hash.
  
  // Since we want to avoid complex MD5 deps if possible, let's use the full image URL 
  // or simple MD5 if we can. 
  // Actually, let's use the MediaWiki "Special:FilePath" which redirects to the actual file.
  // NOTE: This might be slower as it follows redirects.
  
  // Better approach for speed: Use the MD5 algorithm if we had crypto.
  // For this environment, let's assume we can use the 'crypto' module or a simple implementation.
  // BUT, to keep it dependency-free for the client-side (if used there), let's use the FilePath approach.
  
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(safeFilename)}?width=${width}`;
}

/**
 * Fetches details for multiple Wikidata IDs in one batch
 */
export async function getWikiDataDetails(ids: string[]): Promise<Record<string, { description?: string; imageUrl?: string }>> {
  if (ids.length === 0) return {};

  const uniqueIds = Array.from(new Set(ids)).slice(0, 50); // Max 50 per request
  const idsParam = uniqueIds.join('|');
  const url = `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${idsParam}&format=json&props=labels|descriptions|claims&languages=en&origin=*`;

  try {
    const response = await fetch(url);
    if (!response.ok) return {};

    const data: WikiDataResponse = await response.json();
    const results: Record<string, { description?: string; imageUrl?: string }> = {};

    for (const id of uniqueIds) {
      const entity = data.entities[id];
      if (!entity) continue;

      const description = entity.descriptions?.en?.value;
      
      // Get image filename from P18 claim
      const imageClaim = entity.claims?.P18?.[0];
      let imageUrl: string | undefined;
      
      if (imageClaim && imageClaim.mainsnak.datavalue) {
        const filename = imageClaim.mainsnak.datavalue.value;
        imageUrl = resolveWikimediaUrl(filename);
      }

      results[id] = { description, imageUrl };
    }

    return results;
  } catch (error) {
    console.error('WikiData fetch error:', error);
    return {};
  }
}
