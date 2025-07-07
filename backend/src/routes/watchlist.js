import { searchGoogle, addToWatchlist, importFromLink, getWatchlist, removeFromWatchlist } from '../controllers/watchlistController.js';

async function watchlistRoutes(fastify, options) {

	// search google maps restaurant
	fastify.get('/search-google', searchGoogle);

	// add restaurant to watchlist
	fastify.post('/add-to-watchlist', addToWatchlist);

	// import restaurant from google map link
	fastify.post('/import-from-link', importFromLink);

	// get user watchlist
	fastify.get('/', getWatchlist);

	// remove restaurant from watchlist
	fastify.delete('/:restaurantId', removeFromWatchlist);
}

export default watchlistRoutes;