import * as Sentry from "@sentry/nuxt";

// Only run `init` when process.env.SENTRY_DSN is available.
if (useRuntimeConfig().public.sentryDsn) {
  Sentry.init({
    dsn: useRuntimeConfig().public.sentryDsn,
  });
}

