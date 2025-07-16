<template>
  <q-page class="flex column items-center q-pa-md">
    <div class="q-mb-xl text-center">
      <q-btn
        @click="handleRandomSelection"
        color="primary"
        label="隨機選擇"
        size="lg"
        push
        icon="mdi-shuffle-variant"
        :disable="activeWatchlist.length === 0"
      />
      <div v-if="hasWatchlistItems" class="text-caption text-grey q-mt-sm">
        目前有 {{ activeWatchlist.length }} 間餐廳在您的口袋名單中
      </div>
    </div>

    <transition
      appear
      :enter-active-class="`animated ${animation}`"
      leave-active-class="animated fadeOut"
    >
      <div v-if="selectedRestaurant" class="restaurant-card-container">
        <q-card class="restaurant-card bg-grey-9 flex-grow" flat bordered>
          <q-card-section class="flex-grow">
            <div class="text-h6 text-grey-4">{{ selectedRestaurant.name }}</div>
            <div class="text-subtitle2 row items-center">
              <q-rating
                :model-value="selectedRestaurant.rating"
                max="5"
                size="sm"
                color="orange"
                readonly
                class="q-mr-sm "
              />
              {{ selectedRestaurant.rating }} 
              <span v-if="selectedRestaurant.user_ratings_total" class="q-ml-xs text-grey-4">
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
import { useWatchlistStore } from '../stores/watchlistStore'
import { useSelectionStore } from '../stores/selectionStore'
import { useQuasar } from 'quasar';
import { storeToRefs } from 'pinia';

const $q = useQuasar();
const watchlistStore = useWatchlistStore();
const selectionStore = useSelectionStore();
const { selectedRestaurant } = storeToRefs(selectionStore);

const animation = ref('fadeIn');
const animations = ['jackInTheBox', 'rollIn', 'fadeInUp', 'bounceIn', 'tada'];

const activeWatchlist = computed(() => watchlistStore.watchlist);
const hasWatchlistItems = computed(() => watchlistStore.watchlist.length > 0);

const handleRandomSelection = () => {
    selectionStore.clearRestaurant();

    const candidates = activeWatchlist.value;
    if (candidates.length === 0) return;

    setTimeout(() => {
        animation.value = animations[Math.floor(Math.random() * animations.length)];
        selectionStore.selectNewRestaurant(candidates);
    }, 200);
};
</script>

<style scoped>
.restaurant-card-container {
    width: 100%;
    max-width: 400px;
}
</style>