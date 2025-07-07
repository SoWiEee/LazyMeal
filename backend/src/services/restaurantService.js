import { Prisma } from '@prisma/client';

// get random restaurant
export async function getRandomRestaurant(prisma, whereClause) {
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
export async function getAllRestaurants(prisma, whereClause) {
  const restaurants = await prisma.$queryRaw(Prisma.sql`
    SELECT * FROM "restaurants"
    ${whereClause}
  `);
  return restaurants;
}

// create or update local restaurant record (when importing from Google Maps)
export async function upsertLocalRestaurant(prisma, restaurantData) {
  const { place_id, name, address, latitude, longitude, rating, userRatingsTotal, phone, cuisine, priceRange } = restaurantData;

  const existingRestaurant = await prisma.restaurant.findUnique({
    where: { googlePlaceId: place_id },
  });

  if (existingRestaurant) {
    return prisma.restaurant.update({
      where: { id: existingRestaurant.id },
      data: {
        name, address, latitude, longitude, rating, userRatingsTotal, phone, cuisine, priceRange
      },
    });
  } else {
    return prisma.restaurant.create({
      data: {
        googlePlaceId: place_id,
        name, address, latitude, longitude, rating, userRatingsTotal, phone, cuisine, priceRange
      },
    });
  }
}

// get single restaurant
export async function getRestaurantById(prisma, id) {
    return prisma.restaurant.findUnique({
        where: { id },
    });
}

// update restaurant
export async function updateRestaurant(prisma, id, data) {
    return prisma.restaurant.update({
        where: { id },
        data,
    });
}

// delete restaurant
export async function deleteRestaurant(prisma, id) {
    return prisma.restaurant.delete({
        where: { id },
    });
}