<script setup>
import { ref, onMounted } from 'vue'
import { useRestaurantStore } from '../stores/restaurantStore'
import { useNotification } from '../useNotification'
const restaurantStore = useRestaurantStore()
const { showNotification } = useNotification()

const searchQuery = ref('')
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

// 獲取使用者地理位置
const getUserLocationAndSearch = () => {
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(
			(position) => {
				userLat.value = position.coords.latitude
				userLon.value = position.coords.longitude
				searchRestaurants() // 獲取位置後再搜尋
			},
			() => {
				showNotification({ success: false, message: '無法獲取您的位置，將使用預設地點搜尋。' })
				searchRestaurants() // 失敗時使用預設位置搜尋
			}
		)
	}
}

onMounted(() => {
	// searchRestaurants()
	getUserLocationAndSearch()
})
</script>

<template>
    <div class="row q-mb-lg q-gutter-md items-center">
        <div class="col-12 col-sm-8">
            <q-input
                outlined
                dark
                v-model="searchQuery"
                label="輸入餐廳名稱，例如：麥當勞"
                clearable
                @keyup.enter="searchRestaurants"
            >
                <template v-slot:append>
                    <q-icon color="grey-5" name="restaurant" />
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