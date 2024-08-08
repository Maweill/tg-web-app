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
  modules: ["@nuxt/ui"],

  nitro: {
    publicAssets: [
      {
        dir: "./../node_modules/@eversdk/lib-web",
        maxAge: 60 * 60 * 24 * 365, // кэшировать на год
      },
    ],
    devProxy: {
      "/api/": {
        target: "https://testnet.toncenter.com/api/v2/jsonRPC",
        changeOrigin: true,
        prependPath: true,
      },
    },
  },
});
