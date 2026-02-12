<script setup>
import { onMounted } from 'vue'
import { useRestaurantStore } from '../stores/restaurantStore'
import { useWatchlistStore } from '../stores/watchlistStore'
import WatchlistCard from '../components/WatchlistCard.vue'
import RestaurantList from '../components/RestaurantList.vue'
import RestaurantSearch from '../components/RestaurantSearch.vue'

const watchlistStore = useWatchlistStore()
const restaurantStore = useRestaurantStore()

onMounted(() => {
  watchlistStore.fetchWatchlist()
})
</script>

<template>
  <q-page class="home-page q-py-lg">
    <div class="page-header q-mb-lg">
      <h1 class="section-title text-h4">附近餐廳</h1>
      <p class="text-grey-5 q-mt-xs q-mb-none">探索附近餐廳、快速收藏，並維持舒適穩定的瀏覽節奏。</p>
    </div>

    <div class="row q-col-gutter-lg items-start">
      <div class="col-12 col-lg-5">
        <section class="glass-panel panel-wrap q-pa-lg">
          <RestaurantSearch />

          <div class="status-area q-mt-md">
            <q-banner v-if="restaurantStore.isLoading" rounded class="status-banner bg-blue-1 text-blue-10 q-mb-md">
              <q-spinner-dots size="2em" /> 載入中...
            </q-banner>
            <q-banner v-else-if="restaurantStore.error" rounded class="status-banner bg-red-1 text-red-10 q-mb-md">
              <q-icon name="error" color="red" /> 錯誤: {{ restaurantStore.error }}
            </q-banner>
            <q-banner v-else-if="restaurantStore.restaurants.length === 0" rounded class="status-banner bg-orange-1 text-orange-10 q-mb-md">
              <q-icon name="warning" color="orange" /> 沒有找到餐廳。
            </q-banner>
          </div>

          <RestaurantList />
        </section>
      </div>

      <div class="col-12 col-lg-7">
        <section class="glass-panel panel-wrap q-pa-lg">
          <div class="row items-center q-mb-md no-wrap">
            <h2 class="section-title text-h5">我的口袋名單</h2>
          </div>

          <q-banner v-if="watchlistStore.isLoading" rounded class="status-banner bg-blue-1 text-blue-10 q-mb-md">
            <q-spinner-dots size="2em" /> 口袋名單載入中...
          </q-banner>
          <q-banner v-else-if="watchlistStore.error" rounded class="status-banner bg-red-1 text-red-10 q-mb-md">
            <q-icon name="error" color="red" /> 錯誤：{{ watchlistStore.error }}
          </q-banner>
          <q-banner v-else-if="watchlistStore.watchlist.length === 0" rounded class="status-banner bg-blue-1 text-blue-10 q-mb-md">
            <q-icon name="info" color="blue" /> 口袋名單是空的，點擊愛心加入吧！
          </q-banner>

          <WatchlistCard />
        </section>
      </div>
    </div>
  </q-page>
</template>

<style scoped>
.home-page {
  padding-inline: 6px;
}

.page-header {
  max-width: 720px;
}

.panel-wrap {
  min-height: 540px;
}

.status-area {
  min-height: 80px;
}

@media (max-width: 1023px) {
  .panel-wrap {
    min-height: auto;
  }
}
</style>
