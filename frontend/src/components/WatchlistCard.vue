<script setup>
import { useWatchlistStore } from '../stores/watchlistStore'
import { useNotification } from '../useNotification'

const { showNotification } = useNotification()
const watchlistStore = useWatchlistStore()

// 處理從口袋名單移除
const handleRemoveFromWatchlist = async (placeId) => {
	const result = await watchlistStore.removeFromWatchlist(placeId)
	showNotification(result)
}
</script>

<template>
    <div class="row q-col-gutter-sm">
        <div
            class="col-12 col-sm-6"
            v-for="item in watchlistStore.watchlist"
            :key="item.id"
        >
            <q-card flat bordered class="watchlist-card">
            <q-card-section>
                <div class="text-h6">{{ item.name }}</div>
                <div class="text-caption text-grey-7">地址：{{ item.address }}</div>
                <div class="text-caption text-grey-7">評分：{{ item.rating }} ({{ item.user_ratings_total }} 評價)</div>
                <div class="text-caption text-grey-7">距離：{{ item.distance_meters ? item.distance_meters.toFixed(2) : 'N/A' }} 公尺</div>
                <div>價位：{{ item.priceRange || '未提供' }} | 菜系：{{ item.cuisine && item.cuisine.length > 0 ? item.cuisine.join(', ') : '未分類' }}</div>
                <div>加入時間：{{ new Date(item.addedAt).toLocaleString() }}</div>
            </q-card-section>
            <q-card-actions align="right">
                <q-btn flat round icon="delete" color="grey" size="sm" @click="handleRemoveFromWatchlist(item.googlePlaceId)" />
            </q-card-actions>
            </q-card>
        </div>
    </div>
</template>

<style scoped>
.watchlist-card {
	border-radius: 8px;
}
</style>