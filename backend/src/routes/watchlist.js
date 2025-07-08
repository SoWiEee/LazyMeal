import { searchGoogle, addToWatchlist, getWatchlist, removeFromWatchlist } from '../controllers/watchlistController.js';

async function watchlistRoutes(fastify, options) {

	// search google maps restaurant
	fastify.get('/search-google', searchGoogle);

	// add restaurant to watchlist
	fastify.post('/', addToWatchlist);

	// get user watchlist
	fastify.get('/', getWatchlist);

	// remove restaurant from watchlist
	fastify.delete('/:restaurantId', removeFromWatchlist);
}

export default watchlistRoutes;