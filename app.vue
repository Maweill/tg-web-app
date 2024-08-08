<template>
  <TonConnectUIProvider :options="tonConnectOptions">
    <Suspense>
      <template #default>
        <CoinTossGame />
      </template>
      <template #fallback>
        <div>Loading...</div>
      </template>
    </Suspense>
  </TonConnectUIProvider>
</template>

<script setup lang="ts">
import { TonClient } from "@eversdk/core";
import { libWeb, libWebSetup } from "@eversdk/lib-web";
import { TonConnectUIProvider } from "@townsquarelabs/ui-vue";

const tonConnectOptions = {
  manifestUrl: "https://maweill.github.io/tg-web-app/tonconnect-manifest.json",
};

libWebSetup({
  binaryURL: "/tg-web-app/eversdk.wasm",
});

TonClient.useBinaryLibrary(libWeb as any);
</script>

<style>
body {
  color: var(--tg-theme-text-color, #000000);
  background-color: var(--tg-theme-bg-color, #ffffff);
}
</style>
