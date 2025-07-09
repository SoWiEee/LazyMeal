import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api/watchlist';

export const useWatchlistStore = defineStore('watchlist', () => {
    const watchlist = ref([]);
    const isLoading = ref(false);   // 用於 fetchWatchlist
    const error = ref(null);

    const isRestaurantInWatchlist = computed(() => (placeId) => {
        return watchlist.value.some(item => item.place_id === placeId);
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

    const addToWatchlist = async (restaurant) => {
        error.value = null;
        try {
            const response = await axios.post(`${API_BASE_URL}`, restaurant);
            watchlist.value.push(response.data);
            return { success: true, message: `${restaurant.name} 已加入口袋名單！` };
        } catch(err) {
            if (err.response && err.response.status === 409) {
                return { success: false, message: `${restaurant.name} 已在口袋名單中。` };
            }
            error.value = err.response?.data?.message || err.message || '加入口袋名單失敗。';
            console.error('Error adding restaurant to backend:', err);
            return { success: false, message: `加入口袋名單失敗: ${error.value}` };
        }
    };

    const removeFromWatchlist = async (placeId) => {
        error.value = null;
        try{
            await axios.delete(`${API_BASE_URL}/${placeId}`);
            const index = watchlist.value.findIndex(item => item.place_id === placeId);
            if(index !== -1) {
                const removedRestaurant = watchlist.value[index];
                watchlist.value.splice(index, 1); // 成功後更新 store 狀態
                return { success: true, message: `${removedRestaurant.name} 已從口袋名單移除。` };
            }
            return { success: false, message: '餐廳不在口袋名單中。' };
        } catch (err) {
            error.value = err.response?.data?.message || err.message || '移除口袋名單失敗。';
            console.error('[X] Error removing from watchlist:', err);
            return { success: false, message: `移除口袋名單失敗: ${error.value}` };
        }
    };


    const toggleWatchlist = async (restaurant) => {
        error.value = null;

        const index = watchlist.value.findIndex(item => item.place_id === restaurant.place_id);

        if (index === -1) {
            const result = await addToWatchlist(restaurant);
            if (!result.success && result.message.includes('已在口袋名單中')) {
                watchlist.value.push(restaurant);
                return { success: true, message: `${restaurant.name} 已在口袋名單中，已同步前端狀態。` };
            }
            return result;
        } else {
            return await removeFromWatchlist(restaurant.place_id);
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
