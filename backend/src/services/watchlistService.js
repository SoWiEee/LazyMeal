import { Prisma } from '@prisma/client';

export async function addRestaurantToWatchlist(prisma, userId, restaurantId) {
    return await prisma.userRestaurant.create({
        data: {
            userId: userId,
            restaurantId: restaurantId,
            addedAt: new Date(),
        },
        include: {
            restaurant: true,
        },
    });
}

export async function getUserWatchlist(prisma, userId) {
    return await prisma.userRestaurant.findMany({
        where: {
            userId: userId,
        },
        include: {
            restaurant: true,
        },
        orderBy: {
            addedAt: 'desc',
        },
    });
}

export async function removeRestaurantFromWatchlist(prisma, userId, restaurantId) {
    return await prisma.userRestaurant.deleteMany({
        where: {
            userId: userId,
            restaurantId: restaurantId,
        },
    });
}