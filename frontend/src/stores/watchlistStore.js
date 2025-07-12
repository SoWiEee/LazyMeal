import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api/watchlist';

export const useWatchlistStore = defineStore('watchlist', () => {
    const watchlist = ref([]);
    const isLoading = ref(false);
    const error = ref(null);

    const isRestaurantInWatchlist = computed(() => (placeId) => {
        return watchlist.value.some(item => item.googlePlaceId === placeId);
    });

    const fetchWatchlist = async () => {
        isLoading.value = true;
        error.value = null;
        try {
            const response = await axios.get(`${API_BASE_URL}/`);
            watchlist.value = response.data;
        } catch (err) {
            error.value = err.response?.data?.message || err.message || '載入口袋名單失敗。';
            console.error('[X] Error fetching watchlist:', err);
        } finally {
            isLoading.value = false;
        }
    };

    // 傳送欲新增的餐廳物件 OK
    const addToWatchlist = async (restaurant) => {
        error.value = null;
        try {
            const response = await axios.post(`${API_BASE_URL}`, restaurant);

            if (response.data.fullRestaurant) {
                // 把詳細餐廳物件推入 watchlist
                watchlist.value.push(response.data.fullRestaurant);
                return { success: true, message: `${restaurant.name} 已加入口袋名單！` };
            }
            
        } catch(err) {
            if (err.response && err.response.status === 409) {
                return { success: false, reason: 'conflict', message: `${restaurant.name} 已在口袋名單中。` };
            }
            error.value = err.response?.data?.message || err.message || '加入口袋名單失敗。';
            console.error('Error adding restaurant to backend:', err);
            return { success: false, message: `加入口袋名單失敗: ${error.value}` };
        }
    };

    // 根據餐廳 unique ID 刪除資料
    const removeFromWatchlist = async (placeId) => {
        error.value = null;

        const index = watchlist.value.findIndex(item => item.googlePlaceId === placeId);
        // 不存在名單的餐廳 => 直接回傳
        if (index === -1) {
            console.warn(`Attempted to remove a restaurant not in the local watchlist: ${googlePlaceId}`);
            return { success: false, message: '餐廳不在本地口袋名單中。' };
        }

        // 先更新 watchlist 陣列
        const removedRestaurant = watchlist.value.splice(index, 1)[0];

        try {
            await axios.delete(`${API_BASE_URL}/${placeId}`);
            return { success: true, message: `${removedRestaurant.name} 已從口袋名單移除。` };

        } catch (err) {
            // 請求失敗 => 將剛剛移除的項目加回去
            watchlist.value.splice(index, 0, removedRestaurant);
            error.value = err.response?.data?.message || err.message || '移除口袋名單失敗。';
            console.error('[X] Error removing from watchlist:', err);
            return { success: false, message: `移除口袋名單失敗: ${error.value}` };
        }
    };

    // 傳送欲新增的餐廳物件，從口袋名單新增/移除
    const toggleWatchlist = async (restaurant) => {
        error.value = null;

        const placeId = restaurant.place_id;
        // 檢查是否在 watchlist 陣列
        const index = watchlist.value.findIndex(item => item.googlePlaceId === placeId);

        if (index === -1) {
            // 不在名單 => 新增至資料庫
            const result = await addToWatchlist(restaurant);
            // 已存在 => 用資料庫同步 watchlist 陣列
            if (result.reason === 'conflict') {
                await fetchWatchlist();
                return { success: true, message: `${restaurant.name} 已在口袋名單中，狀態已同步。` };
            }
            return result;
        } else {
            return await removeFromWatchlist(placeId);
        }
    };

    return {
        watchlist,
        isLoading,
        error,
        isRestaurantInWatchlist,
        fetchWatchlist,
        addToWatchlist,
        removeFromWatchlist,
        toggleWatchlist
    };
});