<script setup>
import { onMounted, ref } from 'vue'
import { useRestaurantStore } from '../stores/restaurantStore'

const restaurantStore = useRestaurantStore()
const searchQuery = ref('麥當勞')
const userLat = 22.6865
const userLon = 120.3015

const searchRestaurants = () => {
    if (searchQuery.value.trim()) {
        restaurantStore.fetchRestaurants(searchQuery.value, userLat, userLon)
    } else {
        restaurantStore.restaurants = []
        restaurantStore.error = '請輸入餐廳名稱進行搜索。'
    }
}

onMounted(() => {
    searchRestaurants()
})
</script>

<template>
    <q-page class="q-pa-md">
        <h1 class="text-h4 q-mb-md">附近餐廳</h1>
        <div class="row q-mb-lg q-gutter-md items-center">
            <div class="col-12 col-sm-6 col-md-4">
                <q-input outlined v-model="searchQuery" label="輸入餐廳名稱，例如：麥當勞" clearable @keyup.enter="searchRestaurants">
                    <template v-slot:append>
                        <q-icon name="restaurant" />
                    </template>
                </q-input>
            </div>
            <div class="col-12 col-sm-auto"> <q-btn
                color="primary"
                label="搜尋"
                @click="searchRestaurants"
                :loading="restaurantStore.isLoading"
                icon="search"
            />
            </div>
        </div>

        <div class="row justify-center">
            <div class="col-12 col-md-8">
                <q-banner v-if="restaurantStore.isLoading" rounded class="bg-blue-1 text-blue-8 q-mb-md">
                    <q-spinner-dots size="2em" /> 載入中...
                </q-banner>
                <q-banner v-else-if="restaurantStore.error" rounded class="bg-red-1 text-red-8 q-mb-md">
                    <q-icon name="error" color="red" /> 錯誤: {{ restaurantStore.error }}
                </q-banner>
                <q-banner v-else-if="restaurantStore.restaurants.length === 0" rounded class="bg-orange-1 text-orange-8 q-mb-md">
                    <q-icon name="warning" color="orange" /> 沒有找到餐廳。
                </q-banner>
                </div>
        </div>

        <div class="row q-col-gutter-md">
            <div class="col-12 col-md-8" v-for="restaurant in restaurantStore.restaurants" :key="restaurant.place_id">
                <q-card class="my-card">
                    <q-card-section>
                        <div class="text-h6">{{ restaurant.name }}</div>
                        <div class="text-subtitle2">地址: {{ restaurant.address }}</div>
                    </q-card-section>

                    <q-card-section class="q-pt-none">
                        <p>評分: {{ restaurant.rating }} ({{ restaurant.user_ratings_total }} 評價)</p>
                        <p>距離: {{ restaurant.distance_meters.toFixed(2) }} 公尺</p>
                        <p>緯度: {{ restaurant.latitude }}, 經度: {{ restaurant.longitude }}</p>
                    </q-card-section>

                    <q-card-actions align="right">
                        <q-btn flat round icon="favorite_border" color="grey" />
                    </q-card-actions>
                </q-card>
            </div>
        </div>
    </q-page>
</template>
  
<style scoped>
/* 移除或調整 h1 樣式，Quasar 的 text-h4 已經提供很好的預設 */
.text-h4 {
    margin-top: 0; /* 重置可能存在的瀏覽器或全局樣式 */
}

/* 可以為卡片添加一些自定義樣式，例如最大寬度 */
.my-card {
    max-width: 600px; /* 限制卡片的最大寬度 */
    width: 100%; /* 確保卡片在小屏幕上佔滿寬度 */
}

p {
  color: #333 !important;
}
.text-dark {
  color: #333 !important;
}
</style>