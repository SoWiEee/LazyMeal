import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { quasar, transformAssetUrls } from '@quasar/vite-plugin'; // 引入 Quasar Vite 插件

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    quasar({
      autoImportComponentCase: 'pascal',
      transformAssetUrls,
    }),
  ],
})
