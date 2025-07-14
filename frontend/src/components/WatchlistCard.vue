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
	<div class="row q-col-gutter-md">
		<div
			class="col-12 col-md-6"
			v-for="item in watchlistStore.watchlist"
			:key="item.googlePlaceId"
		>
			<q-card dark bordered class="bg-grey-9 watchlist-card">
				<q-card-section>
					<div class="text-h6">{{ item.name }}</div>
					<div class="text-subtitle2 text-grey-5 row items-center">
							<q-icon name="star" color="orange" class="q-mr-xs" />
							{{ item.rating }}
							<span v-if="item.user_ratings_total" class="q-ml-xs">
									({{ item.user_ratings_total }} 則評論)
							</span>
					</div>
				</q-card-section>

				<q-separator dark inset />

				<q-card-section class="q-gutter-sm">
					<div class="row items-start text-body2 text-grey-4">
							<q-icon name="place" class="q-mt-xs q-mr-sm" />
							<div class="col ellipsis">{{ item.address }}</div>
					</div>
					<div class="row items-center text-body2 text-grey-4">
							<q-icon name="directions_walk" class="q-mr-sm" />
							<div>距離：{{ item.distance_meters ? item.distance_meters.toFixed(0) : 'N/A' }} 公尺</div>
					</div>
					<div class="row items-center text-body2 text-grey-4">
							<q-icon name="paid" class="q-mr-sm" />
							<div>價位：{{ item.priceRange || '未提供' }} | 菜系：{{ item.cuisine && item.cuisine.length > 0 ? item.cuisine.join(', ') : '未分類' }}</div>
					</div>
				</q-card-section>

				<q-separator dark />

				<q-card-actions>
						<div class="text-caption text-grey-6">
								<q-icon name="event" class="q-mr-xs" />
								加入於 {{ new Date(item.addedAt).toLocaleString() }}
						</div>
						<q-space />
						<q-btn flat round icon="delete" color="red-4" size="sm" @click="handleRemoveFromWatchlist(item.googlePlaceId)" />
				</q-card-actions>
			</q-card>
		</div>
	</div>
</template>

<style scoped>
.watchlist-card {
	border-radius: 12px;
    height: 100%;
    display: flex;
    flex-direction: column;
}
</style>