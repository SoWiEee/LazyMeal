<script setup>
import { ref, onMounted } from 'vue'
import { useRestaurantStore } from '../stores/restaurantStore'
import { useNotification } from '../useNotification'

const restaurantStore = useRestaurantStore()
const { showNotification } = useNotification()

const searchQuery = ref('')
const userLat = ref(22.6865)
const userLon = ref(120.3015)

const searchRestaurants = () => {
  if (searchQuery.value.trim()) {
    restaurantStore.fetchRestaurants(searchQuery.value, userLat.value, userLon.value)
  } else {
    restaurantStore.restaurants = []
    restaurantStore.error = '請輸入餐廳名稱進行搜索。'
  }
}

const getUserLocationAndSearch = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        userLat.value = position.coords.latitude
        userLon.value = position.coords.longitude
        searchRestaurants()
      },
      () => {
        showNotification({ success: false, message: '無法獲取您的位置，將使用預設地點搜尋。' })
        searchRestaurants()
      }
    )
  }
}

onMounted(() => {
  getUserLocationAndSearch()
})
</script>

<template>
  <div class="row q-mb-md q-gutter-md items-center search-row">
    <div class="col-12 col-sm-8">
      <q-input
        outlined
        dark
        v-model="searchQuery"
        label="輸入餐廳名稱，例如：麥當勞"
        clearable
        @keyup.enter="searchRestaurants"
        class="search-input"
      >
        <template #append>
          <q-icon color="grey-5" name="restaurant" />
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
        class="search-btn"
      />
    </div>
  </div>
</template>

<style scoped>
.search-row {
  margin-right: 0;
}

.search-input :deep(.q-field__control) {
  border-radius: var(--superellipse-radius);
  background: rgba(255, 255, 255, 0.05);
}

.search-btn {
  border-radius: var(--superellipse-radius);
  min-width: 100px;
}
</style>
