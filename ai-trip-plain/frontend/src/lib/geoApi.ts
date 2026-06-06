/**
 * Free Geo API using OpenStreetMap Nominatim
 * No API key required - free for reasonable usage
 * https://nominatim.org/release-docs/develop/api/Search/
 */

export interface GeoResult {
  name: string;
  type: 'city' | 'state' | 'country';
  region?: string;
  country: string;
  country_code: string;
  parentState?: string;
  lat: number;
  lon: number;
}

export interface NominatimResult {
  place_id: number;
  licence: string;
  osm_type: string;
  osm_id: number;
  boundingbox: [string, string, string, string];
  lat: string;
  lon: string;
  display_name: string;
  class: string;
  type: string;
  importance: number;
  icon: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    country?: string;
    country_code?: string;
    county?: string;
    suburb?: string;
  };
}

/**
 * Search for cities and states using Nominatim API
 * @param query - Search query (city name, state name, etc.)
 * @param limit - Maximum number of results (default: 10)
 * @param countrycodes - Limit search to specific countries (e.g., 'in' for India)
 */
export async function searchGeoLocations(
  query: string,
  limit: number = 10,
  countrycodes?: string
): Promise<GeoResult[]> {
  if (!query.trim()) {
    return [];
  }

  try {
    const encodedQuery = encodeURIComponent(query.trim());
    const countryParam = countrycodes ? `&countrycodes=${countrycodes}` : '';
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedQuery}${countryParam}&limit=${limit}&addressdetails=1`;

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Nominatim API error:', response.status);
      return [];
    }

    const results: NominatimResult[] = await response.json();

    return results
      .filter((result) => {
        // Filter for cities, towns, states, and countries
        const validTypes = [
          'city', 'town', 'village', 'state', 'country',
          'administrative', 'locality', 'suburb'
        ];
        return validTypes.includes(result.type) || validTypes.includes(result.class);
      })
      .map((result) => {
        const address = result.address || {};
        const displayName = result.display_name;
        
        // Determine the type
        let type: 'city' | 'state' | 'country' = 'city';
        if (result.type === 'state' || result.class === 'boundary' && result.type === 'administrative') {
          type = 'state';
        } else if (result.type === 'country') {
          type = 'country';
        }

        // Extract the main name (city/town/village name or state name)
        let name = address.city || address.town || address.village || address.state || address.country || displayName.split(',')[0];
        
        // Clean up the name
        name = name.trim();

        return {
          name,
          type,
          region: address.state,
          country: address.country || 'Unknown',
          country_code: address.country_code || '',
          parentState: address.state,
          lat: parseFloat(result.lat),
          lon: parseFloat(result.lon),
        } as GeoResult;
      })
      .filter((result, index, self) => 
        // Remove duplicates based on name and region
        index === self.findIndex(r => r.name === result.name && r.parentState === result.parentState)
      )
      .slice(0, limit);
  } catch (error) {
    console.error('Error searching locations:', error);
    return [];
  }
}

/**
 * Get popular destinations (fallback when API is not available)
 */
export function getPopularDestinations(): GeoResult[] {
  return [
    { name: 'Paris', type: 'city', region: 'Île-de-France', country: 'France', country_code: 'fr', lat: 48.8566, lon: 2.3522 },
    { name: 'London', type: 'city', region: 'England', country: 'United Kingdom', country_code: 'gb', lat: 51.5074, lon: -0.1278 },
    { name: 'Tokyo', type: 'city', region: 'Kanto', country: 'Japan', country_code: 'jp', lat: 35.6762, lon: 139.6503 },
    { name: 'New York', type: 'city', region: 'New York', country: 'United States', country_code: 'us', lat: 40.7128, lon: -74.0060 },
    { name: 'Dubai', type: 'city', region: 'Dubai', country: 'United Arab Emirates', country_code: 'ae', lat: 25.2048, lon: 55.2708 },
    { name: 'Singapore', type: 'city', region: 'Singapore', country: 'Singapore', country_code: 'sg', lat: 1.3521, lon: 103.8198 },
    { name: 'Bangkok', type: 'city', region: 'Bangkok', country: 'Thailand', country_code: 'th', lat: 13.7563, lon: 100.5018 },
    { name: 'Sydney', type: 'city', region: 'New South Wales', country: 'Australia', country_code: 'au', lat: -33.8688, lon: 151.2093 },
    { name: 'Barcelona', type: 'city', region: 'Catalonia', country: 'Spain', country_code: 'es', lat: 41.3851, lon: 2.1734 },
    { name: 'Rome', type: 'city', region: 'Lazio', country: 'Italy', country_code: 'it', lat: 41.9028, lon: 12.4964 },
  ];
}

/**
 * Search destinations with fallback to popular destinations
 */
export async function searchDestinations(
  query: string,
  limit: number = 10,
  countrycodes?: string
): Promise<GeoResult[]> {
  if (!query.trim()) {
    return getPopularDestinations().slice(0, limit);
  }

  const results = await searchGeoLocations(query, limit, countrycodes);
  
  // If no results from API, return popular destinations that match
  if (results.length === 0) {
    const normalizedQuery = query.toLowerCase().trim();
    return getPopularDestinations()
      .filter(d => 
        d.name.toLowerCase().includes(normalizedQuery) ||
        d.country.toLowerCase().includes(normalizedQuery)
      )
      .slice(0, limit);
  }

  return results;
}