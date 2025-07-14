<script setup>
import { ref } from 'vue'
const tab = ref('')
</script>

<template>
	<q-layout view="lHh Lpr lff">
		<q-header elevated class="bg-primary text-white">
			<q-toolbar>
				<q-toolbar-title>
					Lazy Meal
				</q-toolbar-title>

				<q-space />

				<q-tabs v-model="tab" shrink>
					<q-route-tab to="/" name="home" label="新增餐廳" />
					<q-route-tab to="/select" name="select" label="隨機選擇" />
					<q-route-tab to="/watchlist" name="watchlist" label="口袋名單" />
				</q-tabs>
			</q-toolbar>
		</q-header>
    <q-page-container> <router-view /> </q-page-container>

    </q-layout>
</template>

<style scoped>

</style>