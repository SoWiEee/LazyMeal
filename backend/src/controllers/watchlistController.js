import { searchGoogleRestaurants, parseGoogleMapLink, getGooglePlaceDetails } from '../services/googleMapsService.js';
import { addRestaurantToWatchlist, getUserWatchlist, removeRestaurantFromWatchlist } from '../services/watchlistService.js';
import pkg from '@prisma/client';
const { PrismaClientKnownRequestError } = pkg;
import { upsertLocalRestaurant } from '../services/restaurantService.js';

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

// add restaurant to watchlist (update)
export const addToWatchlist = async (request, reply) => {
	// const userId = "1337";	// getUserId(request);
	try {
		// use a temporary userId for testing
		let userId = "1337";
        let user;
		try {
			user = await request.prisma.user.findUnique({
                where: { id: userId },
            });
			if (!user) {
                // 如果用戶不存在，則創建一個新的測試用戶
                // 注意：如果你的 User.id 是 @default(uuid())，你不能直接指定 ID。
                // 這種情況下，你需要讓 Prisma 生成 ID，然後使用該 ID。
                // 這裡假設你可以手動指定 ID (如果你修改了 schema，移除 @default(uuid()))
                // 如果沒有，請看下面關於 UUID 的替代方案
                user = await request.prisma.user.create({
                    data: {
                        id: userId, // 如果你的 User.id 可以手動指定
                        username: `test_user_${userId}`, // 給一個唯一的用戶名
                    },
                });
                request.log.info(`[DEBUG] Created new test user with ID: ${user.id}`);
            } else {
                request.log.info(`[DEBUG] Found existing test user with ID: ${user.id}`);
            }
            userId = user.id; // 確保使用找到或創建的用戶的實際 ID
		} catch (error) {
			request.log.error(`[ERROR] Failed to find or create test user:`, userError);
            throw new Error(`Failed to initialize user for watchlist. Error: ${userError.message}`);
		}

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
		if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
			return reply.status(409).send({ message: 'Restaurant already in your watchlist.' });
		}

        request.log.error('Error adding restaurant to watchlist:', error);
		console.error('Full error stack from addToWatchlist:', error);

		reply.status(500).send({ message: 'Failed to add restaurant to watchlist.', error: error.message });
	}
};

// get user watchlist
export const getWatchlist = async (request, reply) => {
	const userId = "1337";	// temporialrily set userId to 1337 for testing
	try {

        request.log.info(`[DEBUG] userId: ${userId}`);

		const watchlist = await getUserWatchlist(request.prisma, userId);

		request.log.info(`[TEST] Watchlist type: ${typeof watchlist}`);
        request.log.info(`[TEST] Watchlist content: ${JSON.stringify(watchlist, null, 2)}`);

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
		request.log.info(formattedWatchlist)
		reply.send(formattedWatchlist);
		request.log.info(`[V] Fetched ${formattedWatchlist.length} restaurants from user watchlist.`);
	} catch (error) {
		request.log.error('[X] Error fetching user watchlist:', error);
		reply.status(500).send({ message: 'Failed to fetch watchlist.', error: error.message });
	}
};

// delete restaurant from watchlist
export const removeFromWatchlist = async (request, reply) => {
	const userId = "1337";	// getUserId(request);
	const { googlePlaceId } = request.params;
	try {
		await removeRestaurantFromWatchlist(request.prisma, userId, googlePlaceId);
		reply.status(204).send();
	} catch (error) {
		if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
			return reply.status(404).send({ message: 'Restaurant not found in your watchlist.' });
		}
		request.log.error('[X] Error deleting restaurant from watchlist:', error);
		reply.status(500).send({ message: 'Failed to delete restaurant from watchlist.', error: error.message });
	}
};