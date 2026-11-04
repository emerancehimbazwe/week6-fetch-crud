
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/week6-fetch-crud/',
  plugins: [tailwindcss()],
})