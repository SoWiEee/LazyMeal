import axios from 'axios';
import { Prisma } from '@prisma/client';

const GOOGLE_PLACES_API_BASE_URL = 'https://maps.googleapis.com/maps/api/place/textsearch/json';
const GOOGLE_DETAILS_API_BASE_URL = 'https://maps.googleapis.com/maps/api/place/details/json';
const Maps_API_KEY = process.env.Maps_API_KEY;

// search Google Maps restaurants
export async function searchGoogleRestaurants(query, userLat, userLon, prismaInstance) {
    if (!Maps_API_KEY) {
        throw new Error('Google Maps API Key is not configured.');
    }

    const response = await axios.get(GOOGLE_PLACES_API_BASE_URL, {
        params: {
            query: query,
            location: `${userLat},${userLon}`,
            radius: 50000, // 50 km
            key: Maps_API_KEY
        }
    });

    if (response.data.status !== 'OK' && response.data.status !== 'ZERO_RESULTS') {
        throw new Error(response.data.error_message || 'Unknown Google Places API Error');
    }

    let results = response.data.results.map(place => ({
        place_id: place.place_id,
        name: place.name,
        address: place.formatted_address,
        latitude: place.geometry.location.lat,
        longitude: place.geometry.location.lng,
        rating: place.rating || null,
        user_ratings_total: place.user_ratings_total || null,
    }));

    // calculate distance and sort
    if (results.length > 0 && userLat && userLon) {
        const sortedResults = await Promise.all(results.map(async (place) => {
        // use Prisma.$queryRaw to calculate distance
        const distanceResult = await prismaInstance.$queryRaw(Prisma.sql`
            SELECT ST_Distance(
            ST_SetSRID(ST_MakePoint(${place.longitude}, ${place.latitude}), 4326)::geography,
            ST_SetSRID(ST_MakePoint(${userLon}, ${userLat}), 4326)::geography
            ) as distance_meters;
        `);
        return { ...place, distance_meters: distanceResult[0]?.distance_meters || null };
        }));
        results = sortedResults.sort((a, b) => a.distance_meters - b.distance_meters);
    }

  return results;
}

// get Google Place details
export async function getGooglePlaceDetails(placeId, fields = 'name,formatted_address,geometry,rating,user_ratings_total,price_level,types,international_phone_number') {
    if (!Maps_API_KEY) {
        throw new Error('Google Maps API Key is not configured.');
    }

    const response = await axios.get(GOOGLE_DETAILS_API_BASE_URL, {
        params: {
        place_id: placeId,
        key: Maps_API_KEY,
        fields: fields
        }
    });

    if (response.data.status !== 'OK') {
        throw new Error(response.data.error_message || 'Unknown Google Places Details API Error');
    }
    return response.data.result;
}

// helper function: parse Google Maps share link (simplified version, may need to adjust according to actual link mode)
export async function parseGoogleMapLink(link) {
    // this is a highly dependent on Google link format function, may need to maintain
    // ideally, you would want the link to directly contain place_id or shortcode
    let placeId = null;

    // try to match common place_id pattern in URL
    const placeIdRegex = /!1s(0x[0-9a-fA-F]+)/;
    const match = link.match(placeIdRegex);
    if (match && match[1]) {
        placeId = match[1];
    }

    // if not found directly from URL, may need to follow redirect
    if (!placeId) {
        try {
        const response = await axios.get(link, { maxRedirects: 0, validateStatus: status => status >= 200 && status < 400 });
        if (response.headers.location) {
            const redirectedUrl = response.headers.location;
            const redirectedMatch = redirectedUrl.match(placeIdRegex);
            if (redirectedMatch && redirectedMatch[1]) {
            placeId = redirectedMatch[1];
            }
        }
        } catch (redirectError) {
        if (redirectError.response && redirectError.response.headers && redirectError.response.headers.location) {
            const redirectedUrl = redirectError.response.headers.location;
            const redirectedMatch = redirectedUrl.match(placeIdRegex);
            if (redirectedMatch && redirectedMatch[1]) {
            placeId = redirectedMatch[1];
            }
        }
        }
    }

    return placeId;
}