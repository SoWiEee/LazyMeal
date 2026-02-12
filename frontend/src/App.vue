<script setup>
import { ref } from 'vue'

const tab = ref('')
</script>

<template>
  <q-layout view="lHh Lpr lff" class="app-layout">
    <q-header class="app-header q-px-md q-py-sm">
      <q-toolbar class="toolbar-shell">
        <q-toolbar-title class="brand-title">Lazy Meal</q-toolbar-title>

        <q-space />

        <q-tabs v-model="tab" shrink class="app-tabs">
          <q-route-tab to="/" name="home" label="新增餐廳" />
          <q-route-tab to="/select" name="select" label="隨機選擇" />
          <q-route-tab to="/watchlist" name="watchlist" label="口袋名單" />
        </q-tabs>
      </q-toolbar>
    </q-header>

    <q-page-container class="page-shell">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<style scoped>
.app-layout {
  background: transparent;
}

.app-header {
  background: transparent;
  backdrop-filter: none;
}

.toolbar-shell {
  width: min(1180px, 100%);
  margin: 8px auto;
  padding: 8px 18px;
  border-radius: 30px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  background: linear-gradient(135deg, rgba(30, 30, 34, 0.74), rgba(19, 19, 22, 0.68));
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(20px);
}

.brand-title {
  font-weight: 600;
  letter-spacing: 0.01em;
}

.app-tabs {
  border-radius: 999px;
  padding: 3px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

:deep(.q-tab) {
  min-height: 38px;
  border-radius: 999px;
  font-weight: 500;
  opacity: 0.9;
  transition: all 0.25s ease;
}

:deep(.q-tab--active) {
  background: rgba(255, 255, 255, 0.16);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.1);
  opacity: 1;
}

.page-shell {
  width: min(1180px, calc(100% - 2rem));
  margin: 0 auto;
}

@media (max-width: 768px) {
  .toolbar-shell {
    border-radius: 24px;
    padding: 8px 12px;
  }

  .page-shell {
    width: calc(100% - 1rem);
  }
}
</style>
