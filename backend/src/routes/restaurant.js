import { getRestaurants, getRandomRest, getRestaurant, updateRest, deleteRest } from '../controllers/restaurantController.js';

async function restaurantRoutes(fastify, options) {
    // filterable
    fastify.get('/', getRestaurants);

    fastify.get('/random', getRandomRest);

    fastify.get('/:id', getRestaurant);

    // admin
    fastify.put('/:id', updateRest);

    // admin
    fastify.delete('/:id', deleteRest);
}

export default restaurantRoutes;
