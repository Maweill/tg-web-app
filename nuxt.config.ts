export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",
  devtools: { enabled: true },
  app: {
    head: {
      script: [
        { src: "https://telegram.org/js/telegram-web-app.js" },
        {
          src: "https://www.unpkg.com/web-animations-js@latest/web-animations.min.js",
        },
      ],
    },
    baseURL: "/tg-web-app/",
  },
  ssr: false,
});
