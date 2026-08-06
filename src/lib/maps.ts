/**
 * MapmyIndia (Mappls) & Google Maps Platform API helpers.
 */

export const MAPMYINDIA_CONFIG = {
  apiKey: import.meta.env.VITE_MAPMYINDIA_MAP_API_KEY || import.meta.env.VITE_MAP_API_KEY || "",
  clientId: import.meta.env.VITE_MAPMYINDIA_CLIENT_ID || "",
  clientSecret: import.meta.env.VITE_MAPMYINDIA_CLIENT_SECRET || "",
};

export const mapmyIndiaService = {
  /**
   * Get MapmyIndia static map image URL
   */
  getStaticMapUrl(lat: number, lng: number, zoom = 15) {
    const key = MAPMYINDIA_CONFIG.apiKey;
    if (key) {
      return `https://apis.mapmyindia.com/advancedmaps/v1/${key}/still_image?center=${lat},${lng}&zoom=${zoom}&size=600x300&markers=${lat},${lng}`;
    }
    return `https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=600&q=80`;
  },

  /**
   * Mappls / MapmyIndia Reverse Geocoding helper
   */
  async reverseGeocode(lat: number, lng: number): Promise<string> {
    try {
      const key = MAPMYINDIA_CONFIG.apiKey;
      if (!key) return "Hitech City, Hyderabad, Telangana 500081";
      const res = await fetch(`https://apis.mapmyindia.com/advancedmaps/v1/${key}/rev_geocode?lat=${lat}&lng=${lng}`);
      const data = await res.json();
      if (data.results && data.results[0]) {
        return data.results[0].formatted_address || data.results[0].subLocality || "Hitech City, Hyderabad, Telangana 500081";
      }
      return "Hitech City, Hyderabad, Telangana 500081";
    } catch {
      return "Hitech City, Hyderabad, Telangana 500081";
    }
  },
};

export const googleMapsService = {
  /**
   * Generate static map image URL for booking location cards.
   */
  getStaticMapUrl(lat: number, lng: number, zoom = 15) {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || MAPMYINDIA_CONFIG.apiKey || "AIzaSy_placeholder";
    if (MAPMYINDIA_CONFIG.apiKey) {
      return mapmyIndiaService.getStaticMapUrl(lat, lng, zoom);
    }
    return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=600x300&maptype=roadmap&markers=color:orange%7Clabel:H%7C${lat},${lng}&key=${apiKey}`;
  },

  /**
   * Reverse Geocoding helper converting Lat/Lng coordinates into formatted address string.
   */
  async reverseGeocode(lat: number, lng: number): Promise<string> {
    if (MAPMYINDIA_CONFIG.apiKey) {
      return mapmyIndiaService.reverseGeocode(lat, lng);
    }
    try {
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "AIzaSy_placeholder";
      const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`);
      const data = await res.json();
      if (data.results && data.results[0]) {
        return data.results[0].formatted_address;
      }
      return "Hitech City, Hyderabad, Telangana 500081";
    } catch {
      return "Hitech City, Hyderabad, Telangana 500081";
    }
  },
};
