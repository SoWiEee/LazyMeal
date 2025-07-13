<script setup>
import { useWatchlistStore } from '../stores/watchlistStore'
import { useRestaurantStore } from '../stores/restaurantStore'
import { useNotification } from '../useNotification'

const { showNotification } = useNotification()
const watchlistStore = useWatchlistStore()
const restaurantStore = useRestaurantStore()

// 處理愛心按鈕點擊事件
const handleToggleWatchlist = async (restaurant) => {
	const result = await watchlistStore.toggleWatchlist(restaurant)
	showNotification(result)
}
</script>

<template>
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
                    </q-item-section>
                    <q-item-section side top>
                        <q-btn
                            flat
                            round
                            :icon="watchlistStore.isRestaurantInWatchlist(restaurant.place_id) ? 'favorite' : 'favorite_border'"
                            :color="watchlistStore.isRestaurantInWatchlist(restaurant.place_id) ? 'red' : 'grey'"
                            size="sm"
                            @click.stop="handleToggleWatchlist(restaurant)"
                        />
                    </q-item-section>
                </q-item>
            </q-list>
        </div>
    </div>
</template>

<style setup>
.q-item-custom-style {
	padding-top: 10px;
	padding-bottom: 10px;
}
</style>