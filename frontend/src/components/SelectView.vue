<template>
  <q-page class="flex column items-center q-pa-md">
    <div class="q-mb-xl text-center">
      <q-btn
        @click="selectRandomRestaurant"
        color="primary"
        label="隨機選擇"
        size="lg"
        push
        icon="mdi-shuffle-variant"
        :disable="activeWatchlist.length === 0"
      />
      <div v-if="activeWatchlist.length === 0" class="text-caption text-grey q-mt-sm">
        請先在口袋名單中啟用餐廳
      </div>
    </div>

    <transition
      appear
      enter-active-class="animated fadeIn"
      leave-active-class="animated fadeOut"
    >
      <div v-if="selectedRestaurant" class="restaurant-card-container">
        <q-card class="restaurant-card" flat bordered>
          <q-card-section>
            <div class="text-h6">{{ selectedRestaurant.name }}</div>
            <div class="text-subtitle2 row items-center">
              <q-rating
                :model-value="selectedRestaurant.rating"
                max="5"
                size="sm"
                color="orange"
                readonly
                class="q-mr-sm"
              />
              {{ selectedRestaurant.rating }} 
              <span v-if="selectedRestaurant.user_ratings_total" class="q-ml-xs text-grey">
                ({{ selectedRestaurant.user_ratings_total }} 則評論)
              </span>
            </div>
          </q-card-section>

          <q-card-section class="q-pt-none">
            <div class="text-body2">
              <q-icon name="mdi-map-marker" class="q-mr-xs" />
              {{ selectedRestaurant.vicinity }}
            </div>
            <div v-if="selectedRestaurant.opening_hours" class="text-body2 q-mt-sm" :class="selectedRestaurant.opening_hours.open_now ? 'text-positive' : 'text-negative'">
              <q-icon name="mdi-clock-outline" class="q-mr-xs" />
              {{ selectedRestaurant.opening_hours.open_now ? '營業中' : '已打烊' }}
            </div>
          </q-card-section>

          <q-separator />

          <q-card-actions align="right">
            <q-btn
              flat
              color="primary"
              label="查看地圖"
              :href="`https://www.google.com/maps/search/?api=1&query=${selectedRestaurant.name}&query_place_id=${selectedRestaurant.googlePlaceId}`"
              target="_blank"
              icon="mdi-google-maps"
            />
          </q-card-actions>
        </q-card>
      </div>
    </transition>

    <div v-if="!hasWatchlistItems" class="text-center q-mt-xl">
        <p class="text-h6">您的口袋名單是空的！</p>
        <p>請先到首頁搜尋並將餐廳加入口袋名單。</p>
        <q-btn to="/" color="secondary" label="前往首頁" icon="mdi-home" />
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useWatchlistStore } from '@/stores/watchlist';
import { useQuasar } from 'quasar';

const $q = useQuasar();
const watchlistStore = useWatchlistStore();
const selectedRestaurant = ref(null);

const activeWatchlist = computed(() => watchlistStore.watchlist.filter(r => r.toggled));
const hasWatchlistItems = computed(() => watchlistStore.watchlist.length > 0);

const selectRandomRestaurant = () => {
    selectedRestaurant.value = null;

    const candidates = activeWatchlist.value;
    if (candidates.length === 0) return;

    const randomIndex = Math.floor(Math.random() * candidates.length);
    const choice = candidates[randomIndex];

    setTimeout(() => {
        selectedRestaurant.value = choice;
    }, 200);
};
</script>

<style scoped>
.restaurant-card-container {
    width: 100%;
    max-width: 400px;
}
</style>