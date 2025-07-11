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
        console.error('[SERVICE ERROR] Error in getUserWatchlist:', error); // <-- 關鍵：輸出完整錯誤堆棧
        throw error; // 重新拋出錯誤，讓控制器層捕獲
    }
}

export async function removeRestaurantFromWatchlist(prisma, userId, restaurantId) {
    return await prisma.userRestaurant.deleteMany({
        where: {
            userId: userId,
            restaurantId: restaurantId,
        },
    });
}