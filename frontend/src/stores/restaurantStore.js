import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useRestaurantStore = defineStore('restaurant', () => {
    const restaurants = ref([]);
    const isLoading = ref(false);
    const error = ref(null);

    async function fetchRestaurants(query, lat, lon) {
        isLoading.value = true;
        error.value = null;

        try {
            const backendUrl = `http://localhost:3000/api/watchlist/search-google?query=${encodeURIComponent(query)}&lat=${lat}&lon=${lon}`;
            const response = await fetch(backendUrl);
        
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch restaurants.');
            }

            const data = await response.json();
            restaurants.value = data;
        
        } catch (err) {
            console.error('Error fetching restaurants:', err);
            error.value = err.message;
            restaurants.value = [];
        } finally {
            isLoading.value = false;
        }
    }

    return {
        restaurants,
        isLoading,
        error,
        fetchRestaurants
    };
});