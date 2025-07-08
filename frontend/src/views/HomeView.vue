<template>
    <div>
        <h1>附近餐廳</h1>

        <div v-if="restaurantStore.isLoading">載入中...</div>
        <div v-else-if="restaurantStore.error" style="color: red;">
            錯誤: {{ restaurantStore.error }}
        </div>
        <div v-else-if="restaurantStore.restaurants.length > 0">
            <ul style="list-style: none; padding: 0;">
                <li v-for="restaurant in restaurantStore.restaurants" :key="restaurant.place_id" style="margin-bottom: 20px; border: 1px solid #eee; padding: 15px; border-radius: 8px;">
                    <h2>{{ restaurant.name }}</h2>
                    <p><strong>地址:</strong> {{ restaurant.address }}</p>
                    <p><strong>評分:</strong> {{ restaurant.rating }} ({{ restaurant.user_ratings_total }} 評價)</p>
                    <p><strong>距離:</strong> {{ restaurant.distance_meters.toFixed(2) }} 公尺</p>
                    <p>緯度: {{ restaurant.latitude }}, 經度: {{ restaurant.longitude }}</p>
                </li>
            </ul>
        </div>
        <div v-else>
            <p>沒有找到餐廳。</p>
        </div>
    </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRestaurantStore } from '../stores/restaurantStore'

const restaurantStore = useRestaurantStore()

onMounted(() => {
    const query = '麥當勞'
    const lat = 22.6865
    const lon = 120.3015
    restaurantStore.fetchRestaurants(query, lat, lon)
})
</script>


<style scoped>
h1 {
    margin-top: 30px;
}
ul {
    max-width: 800px;
    margin: 0 auto;
}
.restaurant-item {
    background-color: #f9f9f9;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>