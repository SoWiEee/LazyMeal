import { parseQueryParams, buildWhereClause } from '../queryParser.js';
import { getRandomRestaurant, getAllRestaurants, getRestaurantById, updateRestaurant, deleteRestaurant } from '../services/restaurantService.js';

// get all restaurants
export const getRestaurants = async (request, reply) => {
    try {
        const params = parseQueryParams(request.query);
        const whereClause = buildWhereClause(params);
        const restaurants = await getAllRestaurants(request.prisma, whereClause);
        reply.send(restaurants);
        request.log.info(`[V] Fetched ${restaurants.length} restaurants.`);
    } catch (error) {
        request.log.error('Error fetching restaurants:', error);
        reply.status(500).send({ message: 'Error fetching restaurants', error: error.message });
    }
};

// get random restaurant
export const getRandomRestaurant = async (request, reply) => {
    try {
        const params = parseQueryParams(request.query);
        const whereClause = buildWhereClause(params);
        const randomRestaurant = await getRandomRestaurant(request.prisma, whereClause);

        if (!randomRestaurant) {
            return reply.status(404).send({ message: 'No restaurants found matching criteria.' });
        }
        reply.send(randomRestaurant);

    } catch (error) {
        request.log.error('Error selecting random restaurant:', error);
        reply.status(500).send({ message: 'Error selecting random restaurant', error: error.message });
    }
};

// get single restaurant
export const getRestaurant = async (request, reply) => {
    try {
        const { id } = request.params;
        const restaurant = await getRestaurantById(request.prisma, id);
        if (!restaurant) {
            return reply.status(404).send({ message: 'Restaurant not found.' });
        }
        reply.send(restaurant);

    } catch (error) {
        request.log.error('Error fetching single restaurant:', error);
        reply.status(500).send({ message: 'Error fetching restaurant', error: error.message });
    }
};

// update restaurant
export const updateRestaurant = async (request, reply) => { // avoid conflict with other update
    try {
        const { id } = request.params;
        const updatedRestaurant = await updateRestaurant(request.prisma, id, request.body);
        reply.send(updatedRestaurant);

    } catch (error) {
        if (error instanceof request.prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            return reply.status(404).send({ message: 'Restaurant not found.' });
        }
        request.log.error('Error updating restaurant:', error);
        reply.status(500).send({ message: 'Error updating restaurant', error: error.message });
    }
};

// delete restaurant
export const deleteRestaurant = async (request, reply) => { // avoid conflict with other delete
    try {
        const { id } = request.params;
        await deleteRestaurant(request.prisma, id);
        reply.status(204).send();
    } catch (error) {
        if (error instanceof request.prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            return reply.status(404).send({ message: 'Restaurant not found.' });
        }
        request.log.error('Error deleting restaurant:', error);
        reply.status(500).send({ message: 'Error deleting restaurant', error: error.message });
    }
};