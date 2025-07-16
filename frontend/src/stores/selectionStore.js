import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useSelectionStore = defineStore('selection', () => {
    // 用於儲存隨機選擇的餐廳
    const selectedRestaurant = ref(null)

    /**
     * 從候選清單中隨機選擇一間餐廳並更新狀態
     * @param {Array} candidates - 候選餐廳陣列
     */
    function selectNewRestaurant(candidates) {
        if (!candidates || candidates.length === 0) {
        selectedRestaurant.value = null
        return
        }
        const randomIndex = Math.floor(Math.random() * candidates.length)
        selectedRestaurant.value = candidates[randomIndex]
    }

    /**
     * 清除目前選擇的餐廳
     */
    function clearRestaurant() {
        selectedRestaurant.value = null
    }

    return { selectedRestaurant, selectNewRestaurant, clearRestaurant }
})