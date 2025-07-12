import { Prisma } from '@prisma/client';

export const addRestaurantToWatchlist = async (prisma, userId, restaurantId) => {
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
};

export const getUserWatchlist = async (prisma, userId) => {
    try {
        console.log(`[SERVICE DEBUG] Entering getUserWatchlist for userId: ${userId}`);
        console.log(`[SERVICE DEBUG] Checking prisma object: ${!!prisma && typeof prisma === 'object'}`);
        console.log(`[SERVICE DEBUG] Checking prisma.userRestaurant: ${!!prisma.userRestaurant && typeof prisma.userRestaurant === 'object'}`);

        const watchlist = await prisma.userRestaurant.findMany({
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

        console.log(`[SERVICE DEBUG] Successfully executed findMany. Watchlist length: ${watchlist.length}`);
        return watchlist;

    } catch (error) {
        console.error('[SERVICE ERROR] Error in getUserWatchlist:', error);
        throw error;
    }
};

export const removeRestaurantFromWatchlist = async (prisma, userId, googlePlaceId) => {
    // 1. 根據 Google Place ID 找到餐廳的內部 UUID
    const restaurant = await prisma.restaurant.findUnique({
        where: { googlePlaceId: googlePlaceId },
        select: { id: true } // 只選取內部 UUID
    });
    if (!restaurant) {
        const error = new Error('Restaurant not found in the main database.');
        error.statusCode = 404;
        throw error;
    }

    // 2. 使用查找到的內部 UUID 來刪除 UserRestaurant 關聯
    const deletedEntry = await prisma.userRestaurant.deleteMany({
        where: {
            userId: userId,
            restaurantId: restaurant.id, // <-- 使用查找到的內部 UUID
        },
    });
    if (deletedEntry.count === 0) {
        // 如果沒有記錄被刪除，表示該餐廳不在用戶的口袋名單中（可能已經被刪除或未曾加入）
        const error = new Error('Restaurant not found in your watchlist or already removed.');
        // error.code = 'P404Watchlist';
        error.statusCode = 404;
        throw error;
    }
};