// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",
  devtools: { enabled: true },
  app: {
    head: {
      script: [{ src: "https://telegram.org/js/telegram-web-app.js" }],
    },
    // Правильная настройка базового пути для последних версий Nuxt 3
    baseURL: "/tg-web-app/", // Замените 'tg-web-app' на имя вашего репозитория
  },
  // Эти настройки нужны для статического сайта
  ssr: false,
});
