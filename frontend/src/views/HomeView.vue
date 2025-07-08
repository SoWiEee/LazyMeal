<script setup>
import { onMounted, ref } from 'vue'
import { useRestaurantStore } from '../stores/restaurantStore'
import { useQuasar } from 'quasar'

const $q = useQuasar()

const restaurantStore = useRestaurantStore()
const searchQuery = ref('麥當勞')
const userLat = 22.6865
const userLon = 120.3015

const watchlist = ref([])

const searchRestaurants = () => {
	if (searchQuery.value.trim()) {
		restaurantStore.fetchRestaurants(searchQuery.value, userLat, userLon)
	} else {
		restaurantStore.restaurants = []
		restaurantStore.error = '請輸入餐廳名稱進行搜索。'
	}
}

const addToWatchlist = (restaurant) => {
	const exists = watchlist.value.some(item => item.place_id === restaurant.place_id)
	if (!exists) {
		watchlist.value.push(restaurant)
		$q.notify({
			message: `${restaurant.name} 已加入口袋名單！`,
			color: 'green-4',
			icon: 'check_circle',
			position: 'top',
			timeout: 1500
		})
	} else {
		$q.notify({
			message: `${restaurant.name} 已在口袋名單中。`,
			color: 'orange-4',
			icon: 'info',
			position: 'top',
			timeout: 1500
		})
	}
}

onMounted(() => {
  searchRestaurants()
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

			<div class="row q-mt-md">
				<div class="col-12">
					<q-list bordered separator class="q-list-custom-style">
						<q-item
							v-for="restaurant in restaurantStore.restaurants"
							:key="restaurant.place_id"
							clickable v-ripple
							class="q-item-custom-style"
						>
							<q-item-section>
								<q-item-label lines="1" class="text-h6 text-weight-medium">
									{{ restaurant.name }}
								</q-item-label>
								<q-item-label caption lines="2">
									地址：{{ restaurant.address }}
								</q-item-label>
								<q-item-label caption>
									評分：{{ restaurant.rating }} ({{ restaurant.user_ratings_total }} 評價)
								</q-item-label>
								<q-item-label caption>
									距離：{{ restaurant.distance_meters.toFixed(2) }} 公尺
								</q-item-label>
								<!-- <q-item-label caption>
									位置： ({{ restaurant.latitude }}, {{ restaurant.longitude }})
								</q-item-label> -->
							</q-item-section>

							<q-item-section side top>
								<q-btn flat round icon="favorite_border" color="grey" size="sm" />
							</q-item-section>
						</q-item>
					</q-list>
				</div>
			</div>
		</div>

		<!-- section BB -->
			
		<div class="col-12 col-md-5">
			<h2 class="text-h5 q-mb-md">我的口袋名單</h2>
			<q-banner v-if="watchlist.length === 0" rounded class="bg-blue-1 text-blue-8 q-mb-md">
				<q-icon name="info" color="blue" /> 口袋名單是空的，點擊愛心加入吧！
			</q-banner>

			<div class="row q-col-gutter-sm">
				<div class="col-12 col-sm-6" v-for="item in watchlist" :key="item.place_id">
					<q-card flat bordered class="watchlist-card">
						<q-card-section>
							<div class="text-h6">{{ item.name }}</div>
							<div class="text-caption text-grey-7">地址: {{ item.address }}</div>
							<div class="text-caption text-grey-7">評分: {{ item.rating }} ({{ item.user_ratings_total }} 評價)</div>
							<div class="text-caption text-grey-7">距離: {{ item.distance_meters.toFixed(2) }} 公尺</div>
						</q-card-section>
						<q-card-actions align="right">
							<q-btn flat round icon="delete" color="grey" size="sm" @click="removeFromWatchlist(item.place_id)" />
						</q-card-actions>
					</q-card>
				</div>
			</div>
		</div>
	</div>
	</q-page>
</template>

<style scoped>

.q-list-custom-style {
	border-radius: 8px; /* 列表整體圓角 */
	overflow: hidden; /* 確保內容在圓角內 */
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2), 0 8px 16px rgba(0, 0, 0, 0.1); /* 自定義陰影 */
}

/* 可以為每個列表項添加一些內邊距或高度調整 */
.q-item-custom-style {
  /* 例如，增加垂直內邊距 */
	padding-top: 10px;
	padding-bottom: 10px;
}

.q-list-custom-style .q-item-label {
	color: #E0E0E0;
}

.watchlist-card {
	border-radius: 8px;
	/* 可以根據需要添加陰影，但由於是小卡片，flat bordered 可能就夠了 */
	/* box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24); */
}

</style>