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
  modules: ["@nuxt/ui", "@pinia/nuxt", "@sentry/nuxt/module"],
  sentry: {
    debug: true,
    sourceMapsUploadOptions: {
      org: process.env.ORG_SLUG,
      project: process.env.PROJECT_SLUG,
      authToken: process.env.SENTRY_AUTH_TOKEN,
    },
  },
  nitro: {
    publicAssets: [
      {
        dir: "./../node_modules/@eversdk/lib-web",
        maxAge: 60 * 60 * 24 * 365, // cache for a year
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
  vite: {
    define: {
      "process.env.NODE_DEBUG": false,
    },
    build: {
      rollupOptions: {
        external: ["fsevents"],
      },
    },
  },
  plugins: ["~/plugins/buffer.client.ts"],
  runtimeConfig: {
    public: {
      tonCenterAuthToken: process.env.NUXT_TON_CENTER_AUTH_TOKEN,
      sentryDsn: process.env.SENTRY_DSN,
    },
  },
});
