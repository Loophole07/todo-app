export default defineNuxtConfig({
  modules: [
    '@pinia/nuxt',
    '@nuxtjs/tailwindcss'
  ],
  compatibilityDate: '2026-01-21',
  nitro: {
    experimental: {
      wasm: true
    }
  }
})