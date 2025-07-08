import { defineStore } from 'pinia';
import { ref } from 'vue';

const API_BASE_URL = 'http://localhost:3000';

export const useWatchlistStore = defineStore('watchlist', () => {
    const watchlist = ref([]);
    const isLoading = ref(false);
    const error = ref(null);

    async function fetchWatchlist() {
        isLoading.value = true;
        error.value = null;

        const response = await axios.get(`${API_BASE_URL}/api/watchlist/`);
        watchlist.value = response.data;
        isLoading.value = false;
    }

    async function addToWatchlist(watchlist) {
        await axios.post(`${API_BASE_URL}/api/watchlist`, watchlist);
    }

    async function removeFromWatchlist(restaurantId) {
        isLoading.value = true;
        error.value = null;
        await axios.delete(`${API_BASE_URL}/api/watchlist/${restaurantId}`);
        watchlist.value = watchlist.value.filter(item => item.id !== restaurantId);
        isLoading.value = false;
    }

    return {
        watchlist,
        isLoading,
        error,
        fetchWatchlist,
        addToWatchlist,
        removeFromWatchlist
    };
});
