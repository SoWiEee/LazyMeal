<script setup>
import { ref } from 'vue'
import { useRestaurantStore } from '../stores/restaurantStore'
const restaurantStore = useRestaurantStore()

const searchQuery = ref('麥當勞')
const userLat = ref(22.6865)	// 預設緯度
const userLon = ref(120.3015)	// 預設經度

const searchRestaurants = () => {
	if (searchQuery.value.trim()) {
		restaurantStore.fetchRestaurants(searchQuery.value, userLat.value, userLon.value)
	} else {
		restaurantStore.restaurants = []
		restaurantStore.error = '請輸入餐廳名稱進行搜索。'
	}
}
</script>

<template>
    <div class="row q-mb-lg q-gutter-md items-center">
        <div class="col-12 col-sm-8">
            <q-input
                outlined
                v-model="searchQuery"
                label="輸入餐廳名稱，例如：麥當勞"
                clearable
                @keyup.enter="searchRestaurants"
            >
                <template v-slot:append>
                    <q-icon name="restaurant" />
                </template>
            </q-input>
        </div>
        <div class="col-12 col-sm-auto">
            <q-btn
            color="primary"
            label="搜尋"
            @click="searchRestaurants"
            :loading="restaurantStore.isLoading"
            icon="search"
            />
        </div>
    </div>
</template>

