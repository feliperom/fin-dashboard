// nuxt.config.ts
export default defineNuxtConfig({
  modules: [
    '@nuxt/ui',
    '@pinia/nuxt'
  ],
  colorMode: {
    preference: 'dark',
    fallback: 'dark',
    classSuffix: ''
  },
  css: ['~/assets/css/main.css'],
  compatibilityDate: '2024-01-01',
  routeRules: {
    '/sw.js': { ssr: false, index: false }
  },
  nitro: {
    // Configurações para garantir que as APIs funcionem no Vercel
    preset: 'vercel'
  },
  runtimeConfig: {
    // Variáveis públicas (disponíveis no cliente e servidor)
    public: {
      // Base URL da API (será resolvida automaticamente)
    }
  }
})

