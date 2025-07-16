<script setup>
import { onMounted } from 'vue';
import { useWatchlistStore } from '../stores/watchlistStore';
import { useNotification } from '../useNotification';

const watchlistStore = useWatchlistStore();
const { showNotification } = useNotification();

onMounted(() => {
    watchlistStore.fetchWatchlist();
});

const handleRemoveFromWatchlist = async (restaurant) => {
    const result = await watchlistStore.removeFromWatchlist(restaurant.googlePlaceId);
    showNotification(result);
};
</script>

<template>
  <q-page class="q-pa-md">
    <h1 class="text-h4 q-mb-md">我的口袋名單</h1>

    <template v-if="watchlistStore.isLoading">
      <q-banner rounded class="bg-blue-1 text-blue-8">
        <template v-slot:avatar>
          <q-spinner-dots size="2em" />
        </template>
        口袋名單載入中...
      </q-banner>
    </template>
    <template v-else-if="watchlistStore.error">
      <q-banner rounded class="bg-red-1 text-red-8">
        <template v-slot:avatar>
          <q-icon name="error" color="red" />
        </template>
        錯誤：{{ watchlistStore.error }}
      </q-banner>
    </template>
    <template v-else-if="watchlistStore.watchlist.length === 0">
      <q-banner rounded class="bg-blue-1 text-blue-8">
        <template v-slot:avatar>
          <q-icon name="info" color="blue" />
        </template>
        口袋名單是空的，從主頁搜尋並點擊愛心加入吧！
      </q-banner>
    </template>

    <!-- 口袋名單內容 -->
    <div v-else class="row q-col-gutter-md">
      <div
        v-for="restaurant in watchlistStore.watchlist"
        :key="restaurant.googlePlaceId"
        class="col-12 col-sm-6 col-md-4 col-lg-3"
      >
        <q-card dark flat bordered class="watchlist-card full-height bg-grey-9 flex-grow">
          <q-card-section class="flex-grow">
            <div class="text-h6">{{ restaurant.name }}</div>
          </q-card-section>

          <q-separator dark inset />

          <q-card-section>
            <div class="text-caption text-grey-4 q-mt-sm">地址：{{ restaurant.address }}</div>
            <div class="text-caption text-grey-4">
              評分：{{ restaurant.rating }} ({{ restaurant.userRatingsTotal }} 則評價)
            </div>
            <div class="text-caption text-grey-4">
              價位：{{ restaurant.priceRange || '未提供' }} | 菜系：{{
                restaurant.cuisine && restaurant.cuisine.length > 0 ? restaurant.cuisine.join(', ') : '未分類'
              }}
            </div>
          </q-card-section>

          <q-separator dark inset />

          <q-card-section>
            <div class="text-caption text-grey-7 q-mt-sm">
              <q-icon name="event" class="q-mr-xs" />加入時間：{{ new Date(restaurant.addedAt).toLocaleString() }}
            </div>
          </q-card-section>

          <q-card-actions align="right" class="q-pt-none">
            <q-btn flat round icon="delete" color="red-4" size="sm" @click="handleRemoveFromWatchlist(restaurant)" aria-label="從口袋名單移除" />
          </q-card-actions>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<style scoped>

.watchlist-card {
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}
</style>