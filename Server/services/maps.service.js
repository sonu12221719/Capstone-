const PLACES_BASE = "https://maps.googleapis.com/maps/api/place";

const mapsKey = () => {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key || key === "your_google_maps_api_key_here") {
    throw new Error("GOOGLE_MAPS_API_KEY is not configured in .env");
  }
  return key;
};

/**
 * Find pharmacies near a coordinate using Google Maps Places Nearby Search.
 */
export const findNearbyPharmacies = async (lat, lng, radiusMeters = 5000) => {
  const params = new URLSearchParams({
    location: `${lat},${lng}`,
    radius: radiusMeters,
    type: "pharmacy",
    key: mapsKey(),
  });

  const res = await fetch(`${PLACES_BASE}/nearbysearch/json?${params}`);
  const data = await res.json();

  if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
    throw new Error(`Google Places API error: ${data.status} — ${data.error_message || "unknown"}`);
  }

  return (data.results || []).map((p) => ({
    placeId: p.place_id,
    name: p.name,
    address: p.vicinity || "",
    rating: p.rating ?? null,
    totalRatings: p.user_ratings_total ?? 0,
    isOpen: p.opening_hours?.open_now ?? null,
    location: {
      lat: p.geometry.location.lat,
      lng: p.geometry.location.lng,
    },
    distance: haversineKm(lat, lng, p.geometry.location.lat, p.geometry.location.lng),
  })).sort((a, b) => a.distance - b.distance);
};

/**
 * Get detailed info (phone, website) for a specific place.
 */
export const getPlaceDetails = async (placeId) => {
  const params = new URLSearchParams({
    place_id: placeId,
    fields: "name,formatted_address,formatted_phone_number,website,opening_hours",
    key: mapsKey(),
  });

  const res = await fetch(`${PLACES_BASE}/details/json?${params}`);
  const data = await res.json();

  if (data.status !== "OK") {
    throw new Error(`Place details error: ${data.status}`);
  }

  return {
    name: data.result.name,
    address: data.result.formatted_address,
    phone: data.result.formatted_phone_number || null,
    website: data.result.website || null,
    openNow: data.result.opening_hours?.open_now ?? null,
    hours: data.result.opening_hours?.weekday_text || [],
  };
};

/**
 * Reverse-geocode a lat/lng to a human-readable address.
 */
export const reverseGeocode = async (lat, lng) => {
  const params = new URLSearchParams({
    latlng: `${lat},${lng}`,
    key: mapsKey(),
  });

  const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?${params}`);
  const data = await res.json();

  if (data.status !== "OK" || !data.results?.length) return "";
  return data.results[0].formatted_address;
};

// Haversine formula — straight-line km between two coordinates
function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = deg2rad(lat2 - lat1);
  const dLng = deg2rad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
function deg2rad(d) { return d * (Math.PI / 180); }
