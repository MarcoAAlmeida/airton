// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    'nuxt-auth-utils'
  ],

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    airtonAdminEmail: '',
    airtonAdminPassword: '',
    airtonApiToken: '',
    airtonApiUrl: 'http://localhost:8787',
    airtonClientEmail: '',
    airtonClientPassword: ''
  },

  routeRules: {
    '/': { prerender: false }
  },

  compatibilityDate: '2026-08-16',

  nitro: {
    preset: 'cloudflare-pages'
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }
})
