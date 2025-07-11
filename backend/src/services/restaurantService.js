import { Prisma } from '@prisma/client';

// get random restaurant
export const getRandomRestaurant = async (prisma, whereClause) => {
	const countResult = await prisma.$queryRaw(Prisma.sql`
		SELECT COUNT(*) FROM "restaurants"
		${whereClause}
	`);
	const count = Number(countResult[0]?.count || 0);

	if (count === 0) {
		return null;
	}

	const offset = Math.floor(Math.random() * count);

	const randomRestaurant = await prisma.$queryRaw(Prisma.sql`
		SELECT * FROM "restaurants"
		${whereClause}
		OFFSET ${offset}
		LIMIT 1
	`);

  	return randomRestaurant[0] || null;
}

// get all restaurants (basic search)
export const getAllRestaurants = async (prisma, whereClause) => {
	const restaurants = await prisma.$queryRaw(Prisma.sql`
		SELECT * FROM "restaurants"
		${whereClause}
	`);
	return restaurants;
}

// create or update local restaurant record
export const upsertLocalRestaurant = async (prisma, restaurantData) => {
	const { place_id, name, address, latitude, longitude, rating, user_ratings_total, cuisine, priceRange } = restaurantData;
	return prisma.restaurant.upsert({
        where: { googlePlaceId: place_id },
        update: {
            name: name,
            address: address,
            longitude: longitude,
            latitude: latitude,
            rating: rating,
            userRatingsTotal: user_ratings_total,
            cuisine: cuisine,
            priceRange: priceRange,
        },
        create: {
            googlePlaceId: place_id,
            name: name,
            address: address,
            latitude: latitude,
            longitude: longitude,
            rating: rating,
            userRatingsTotal: user_ratings_total,
            cuisine: cuisine || [],
            priceRange: priceRange,
        },
    });
};

// export async function upsertLocalRestaurant(prisma, restaurantData) {
// 	const { place_id, name, address, latitude, longitude, rating, userRatingsTotal, phone, cuisine, priceRange } = restaurantData;

// 	const existingRestaurant = await prisma.restaurant.findUnique({
// 		where: { googlePlaceId: place_id },
// 	});

// 	if (existingRestaurant) {
// 		return prisma.restaurant.update({
// 			where: { id: existingRestaurant.id },
// 			data: {
// 				name, address, latitude, longitude, rating, userRatingsTotal, phone, cuisine, priceRange
// 			},
// 		});
// 	} else {
// 		return prisma.restaurant.create({
// 			data: {
// 				googlePlaceId: place_id,
// 				name, address, latitude, longitude, rating, userRatingsTotal, phone, cuisine, priceRange
// 			},
// 		});
// 	}
// }

// get single restaurant
export const getRestaurantById = async (prisma, id) => {
    return prisma.restaurant.findUnique({
        where: { id },
    });
};

// update restaurant
export const updateRestaurant = async (prisma, id, data) => {
	return prisma.restaurant.update({
		where: { id },
		data,
	});
};

// delete restaurant
export const deleteRestaurant = async (prisma, id) => {
	return prisma.restaurant.delete({
		where: { id },
	});
}