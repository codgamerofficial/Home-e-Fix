/**
 * Google Maps Platform API helpers (Places, Geocoding, Static Maps).
 */
export const googleMapsService = {
  /**
   * Generate static map image URL for booking location cards.
   */
  getStaticMapUrl(lat: number, lng: number, zoom = 15) {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "AIzaSy_placeholder";
    return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=600x300&maptype=roadmap&markers=color:orange%7Clabel:H%7C${lat},${lng}&key=${apiKey}`;
  },

  /**
   * Reverse Geocoding helper converting Lat/Lng coordinates into formatted address string.
   */
  async reverseGeocode(lat: number, lng: number): Promise<string> {
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
