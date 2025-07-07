import { searchGoogleRestaurants, parseGoogleMapLink, getGooglePlaceDetails } from '../services/googleMapsService.js';
import { upsertLocalRestaurant } from '../services/restaurantService.js';
import { addRestaurantToWatchlist, getUserWatchlist, removeRestaurantFromWatchlist } from '../services/watchlistService.js';

// TODO: get actual userId from JWT or Session
const getUserId = (request) => {
    return "123";
};

// Google Maps restaurant search
export const searchGoogle = async (request, reply) => {
    try {
        const { query, lat, lon } = request.query;

        if (!query) {
            return reply.status(400).send({ message: 'Missing search query.' });
        }
        if (!lat || !lon) {
            return reply.status(400).send({ message: 'Missing user location (latitude, longitude).' });
        }

        const userLat = parseFloat(lat);
        const userLon = parseFloat(lon);

        if (isNaN(userLat) || isNaN(userLon)) {
            return reply.status(400).send({ message: 'Invalid user location.' });
        }

        const results = await searchGoogleRestaurants(query, userLat, userLon, request.prisma);
        request.log.info(`[V] Fetched ${results.length} restaurants from Google Maps.`);
        return reply.send(results);

    } catch (error) {
        request.log.error('[x] Error in Google Maps search:', error);
        return reply.status(500).send({ message: 'Failed to search Google Maps.', error: error.message });
    }
};

// add restaurant to watchlist
export const addToWatchlist = async (request, reply) => {
	const userId = getUserId(request);
	try {
		const { place_id, name, address, latitude, longitude, rating, user_ratings_total } = request.body;
		if (!place_id || !name || !address || typeof latitude !== 'number' || typeof longitude !== 'number') {
			return reply.status(400).send({ message: 'Missing required restaurant data.' });
		}

		const restaurant = await upsertLocalRestaurant(request.prisma, {
			place_id, name, address, latitude, longitude, rating, user_ratings_total,
			cuisine: [], // TODO: how to get or let user input
			priceRange: null // TODO: how to get or let user input
		});

		const userRestaurant = await addRestaurantToWatchlist(request.prisma, userId, restaurant.id);
		reply.status(201).send({
			message: 'Restaurant added to watchlist successfully!',
			restaurant: userRestaurant,
			fullRestaurant: restaurant
		});
		request.log.info(`[V] Restaurant added to watchlist: ${restaurant.id}`);
	} catch (error) {
		if (error instanceof request.prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
			return reply.status(409).send({ message: 'Restaurant already in your watchlist.' });
		}
		request.log.error('Error adding restaurant to watchlist:', error);
		reply.status(500).send({ message: 'Failed to add restaurant to watchlist.', error: error.message });
	}
};

// import restaurant from link to watchlist
export const importFromLink = async (request, reply) => {
    const userId = getUserId(request);
    const { link } = request.body;

    if (!link) {
        return reply.status(400).send({ message: 'Missing Google Maps link.' });
    }

    try {
        const placeId = await parseGoogleMapLink(link);
        if (!placeId) {
            return reply.status(400).send({ message: 'Could not extract Place ID from the provided link.' });
        }

        const placeDetails = await getGooglePlaceDetails(placeId);

        const cuisineTypes = placeDetails.types ? placeDetails.types.filter(type => !['point_of_interest', 'establishment', 'food'].includes(type)) : [];
        const priceRangeMap = { 1: '低', 2: '中', 3: '高', 4: '高' }; // TODO: adjust or expand

        const restaurantData = {
            place_id: placeDetails.place_id,
            name: placeDetails.name,
            address: placeDetails.formatted_address,
            latitude: placeDetails.geometry.location.lat,
            longitude: placeDetails.geometry.location.lng,
            rating: placeDetails.rating || null,
            userRatingsTotal: placeDetails.user_ratings_total || null,
            phone: placeDetails.international_phone_number || null,
            cuisine: cuisineTypes,
            priceRange: placeDetails.price_level ? priceRangeMap[placeDetails.price_level] : null,
        };

        const restaurant = await upsertLocalRestaurant(request.prisma, restaurantData);
        await addRestaurantToWatchlist(request.prisma, userId, restaurant.id);
		request.log.info(`[V] Restaurant imported from link and added to watchlist: ${restaurant.id}`);
        reply.status(201).send({
            message: 'Restaurant imported from link and added to watchlist!',
            fullRestaurant: restaurant
        });
    } catch (error) {
        request.log.error('[X] Error importing from link:', error);
        reply.status(500).send({ message: 'Failed to import restaurant from link.', error: error.message });
    }
};

// get user watchlist
export const getWatchlist = async (request, reply) => {
	const userId = getUserId(request);
	try {
		const watchlist = await getUserWatchlist(request.prisma, userId);
		const formattedWatchlist = watchlist.map(item => ({
			id: item.restaurant.id,
			googlePlaceId: item.restaurant.googlePlaceId,
			name: item.restaurant.name,
			address: item.restaurant.address,
			rating: item.restaurant.rating,
			userRatingsTotal: item.restaurant.userRatingsTotal,
			priceRange: item.restaurant.priceRange,
			cuisine: item.restaurant.cuisine,
			latitude: item.restaurant.latitude,
			longitude: item.restaurant.longitude,
			addedAt: item.addedAt,
		}));
		reply.send(formattedWatchlist);
		request.log.info(`[V] Fetched ${formattedWatchlist.length} restaurants from user watchlist.`);
	} catch (error) {
		request.log.error('[X] Error fetching user watchlist:', error);
		reply.status(500).send({ message: 'Failed to fetch watchlist.', error: error.message });
	}
};

// delete restaurant from watchlist
export const removeFromWatchlist = async (request, reply) => {
	const userId = getUserId(request);
	const { restaurantId } = request.params;
	try {
		await removeRestaurantFromWatchlist(request.prisma, userId, restaurantId);
		reply.status(204).send();
	} catch (error) {
		if (error instanceof request.prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
			return reply.status(404).send({ message: 'Restaurant not found in your watchlist.' });
		}
		request.log.error('[X] Error deleting restaurant from watchlist:', error);
		reply.status(500).send({ message: 'Failed to delete restaurant from watchlist.', error: error.message });
	}
};