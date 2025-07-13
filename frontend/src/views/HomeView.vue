<script setup>
import { onMounted, ref } from 'vue'
import { useRestaurantStore } from '../stores/restaurantStore'
import { useWatchlistStore } from '../stores/watchlistStore'
import { useNotification } from '../useNotification'
import WatchlistCard from '../components/WatchlistCard.vue'
import RestaurantList from '../components/RestaurantList.vue'

const { showNotification } = useNotification()
const watchlistStore = useWatchlistStore()
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
	searchRestaurants()
	// getUserLocationAndSearch()
	watchlistStore.fetchWatchlist()
})
</script>

<template>
	<q-page class="q-pa-md">
	<h1 class="text-h4 q-mb-md">附近餐廳</h1>
	<div class="row q-col-gutter-md">

		<!-- section AA -->
		<div class="col-12 col-md-7">

			<!-- section A -->
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

			<!-- section B -->
			<div class="row">
				<div class="col-12">
					<q-banner v-if="restaurantStore.isLoading" rounded class="bg-blue-1 text-blue-8 q-mb-md">
						<q-spinner-dots size="2em" /> Loading...
					</q-banner>
					<q-banner v-else-if="restaurantStore.error" rounded class="bg-red-1 text-red-8 q-mb-md">
						<q-icon name="error" color="red" /> 錯誤: {{ restaurantStore.error }}
					</q-banner>
					<q-banner v-else-if="restaurantStore.restaurants.length === 0" rounded class="bg-orange-1 text-orange-8 q-mb-md">
						<q-icon name="warning" color="orange" /> 沒有找到餐廳。
					</q-banner>
				</div>
			</div>

			<!-- section C -->
			<RestaurantList/>
		</div>

		<!-- section BB -->
			
		<div class="col-12 col-md-5">
			<div class="row items-center q-mb-md no-wrap">
				<h2 class="text-h5 q-mr-md q-my-none">我的口袋名單</h2>
			</div>
			
			<q-banner v-if="watchlistStore.isLoading" rounded class="bg-blue-1 text-blue-8 q-mb-md">
				<q-spinner-dots size="2em" /> 口袋名單載入中...
			</q-banner>
			<q-banner v-else-if="watchlistStore.error" rounded class="bg-red-1 text-red-8 q-mb-md">
				<q-icon name="error" color="red" /> 錯誤：{{ watchlistStore.error }}
			</q-banner>
			<q-banner v-else-if="watchlistStore.watchlist.length === 0" rounded class="bg-blue-1 text-blue-8 q-mb-md">
				<q-icon name="info" color="blue" /> 口袋名單是空的，點擊愛心加入吧！
			</q-banner>

			<!-- watchlist card component -->
			<WatchlistCard/>
		</div>
	</div>
	</q-page>
</template>

<style scoped>

.q-list-custom-style {
	border-radius: 8px;
	overflow: hidden; /* 確保內容在圓角內 */
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2), 0 8px 16px rgba(0, 0, 0, 0.1);
}

/* 可以為每個列表項添加一些內邊距或高度調整 */
.q-item-custom-style {
	padding-top: 10px;
	padding-bottom: 10px;
}

.q-list-custom-style .q-item-label {
	color: #E0E0E0;
}

.watchlist-card {
	border-radius: 8px;
}

</style>