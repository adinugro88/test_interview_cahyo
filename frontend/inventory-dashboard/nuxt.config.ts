// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devServer: {
    host: '0.0.0.0',
    port: 8080
  },
  build: {
    transpile: ['chart.js']
  }
})
