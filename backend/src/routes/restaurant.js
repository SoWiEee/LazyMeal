import { getRestaurants, getRandom, getRestaurant, updateRest, deleteRest } from '../controllers/restaurantController.js';

async function restaurantRoutes(fastify, options) {
    // filterable
    fastify.get('/', getRestaurants);

    fastify.get('/random', getRandom);

    fastify.get('/:id', getRestaurant);

    // admin
    fastify.put('/:id', updateRest);

    // admin
    fastify.delete('/:id', deleteRest);
}

export default restaurantRoutes;
