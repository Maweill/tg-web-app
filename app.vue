<template>
  <TonConnectUIProvider :options="tonConnectOptions">
    <Suspense>
      <template #default>
        <AppContent />
      </template>
      <template #fallback>
        <div>Loading...</div>
      </template>
    </Suspense>
  </TonConnectUIProvider>
</template>

<script setup>
import { TonConnectUIProvider } from "@townsquarelabs/ui-vue";

const tonConnectOptions = {
  manifestUrl: "https://maweill.github.io/tg-web-app/tonconnect-manifest.json",
};
</script>

<style>
body {
  color: var(--tg-theme-text-color, #000000);
  background-color: var(--tg-theme-bg-color, #ffffff);
}
</style>
