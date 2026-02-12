<template>
  <q-page class="select-page q-py-lg">
    <section class="glass-panel hero-panel q-pa-xl text-center">
      <h1 class="section-title text-h4 q-mb-sm">隨機選擇</h1>
      <p class="text-grey-5 q-mb-lg">從口袋名單中抽一間，今晚就決定這家。</p>

      <q-btn
        @click="handleRandomSelection"
        color="primary"
        label="隨機選擇"
        size="lg"
        push
        icon="mdi-shuffle-variant"
        :disable="activeWatchlist.length === 0"
        class="shuffle-btn"
      />
      <div v-if="hasWatchlistItems" class="text-caption text-grey-5 q-mt-sm">
        目前有 {{ activeWatchlist.length }} 間餐廳在您的口袋名單中
      </div>
    </section>

    <transition appear :enter-active-class="`animated ${animation}`" leave-active-class="animated fadeOut">
      <div v-if="selectedRestaurant" class="restaurant-card-container q-mt-lg">
        <q-card class="restaurant-card" flat bordered>
          <q-card-section>
            <div class="text-h6">{{ selectedRestaurant.name }}</div>
            <div class="text-subtitle2 row items-center text-grey-5">
              <q-rating :model-value="selectedRestaurant.rating" max="5" size="sm" color="orange" readonly />
              <span class="q-ml-xs">({{ selectedRestaurant.user_ratings_total }} 則評論)</span>
            </div>
          </q-card-section>

          <q-card-section class="q-pt-none text-grey-4">
            <div class="text-body2">
              <q-icon name="mdi-map-marker" class="q-mr-xs" />
              {{ selectedRestaurant.vicinity }}
            </div>
            <div
              v-if="selectedRestaurant.opening_hours"
              class="text-body2 q-mt-sm"
              :class="selectedRestaurant.opening_hours.open_now ? 'text-positive' : 'text-negative'"
            >
              <q-icon name="mdi-clock-outline" class="q-mr-xs" />
              {{ selectedRestaurant.opening_hours.open_now ? '營業中' : '已打烊' }}
            </div>
          </q-card-section>

          <q-separator dark />

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

    <div v-if="!hasWatchlistItems" class="glass-panel empty-state text-center q-mt-lg q-pa-xl">
      <p class="text-h6 q-mb-sm">您的口袋名單是空的！</p>
      <p class="q-mb-md text-grey-5">請先到首頁搜尋並將餐廳加入口袋名單。</p>
      <q-btn to="/" color="secondary" label="前往首頁" icon="mdi-home" />
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useWatchlistStore } from '../stores/watchlistStore'
import { useSelectionStore } from '../stores/selectionStore'
import { storeToRefs } from 'pinia'

const watchlistStore = useWatchlistStore()
const selectionStore = useSelectionStore()
const { selectedRestaurant } = storeToRefs(selectionStore)

const animation = ref('fadeIn')
const animations = ['jackInTheBox', 'rollIn', 'fadeInUp', 'bounceIn', 'tada']

const activeWatchlist = computed(() => watchlistStore.watchlist)
const hasWatchlistItems = computed(() => watchlistStore.watchlist.length > 0)

const handleRandomSelection = () => {
  selectionStore.clearRestaurant()

  const candidates = activeWatchlist.value
  if (candidates.length === 0) return

  setTimeout(() => {
    animation.value = animations[Math.floor(Math.random() * animations.length)]
    selectionStore.selectNewRestaurant(candidates)
  }, 200)
}
</script>

<style scoped>
.select-page {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.hero-panel,
.empty-state {
  width: min(760px, 100%);
}

.shuffle-btn {
  border-radius: 999px;
  padding-inline: 12px;
}

.restaurant-card-container {
  width: min(620px, 100%);
}

.restaurant-card {
  border-radius: 30px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: linear-gradient(150deg, rgba(255, 255, 255, 0.09), rgba(255, 255, 255, 0.02));
  box-shadow: 0 18px 36px rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(18px);
}
</style>
