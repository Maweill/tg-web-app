<template>
  <TonConnectUIProvider :options="tonConnectOptions">
    <div class="container">
      <h1>Telegram Mini App</h1>
      <p>Hi!</p>
      <p v-if="userInfo">Hello, {{ userInfo.first_name }}!</p>
      <TonConnectButton class-name="ton-connect-button" />
    </div>
  </TonConnectUIProvider>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { TonConnectUIProvider, TonConnectButton } from "@townsquarelabs/ui-vue";

const userInfo = ref(null);
const tonConnectOptions = {
  manifestUrl: `${window.location.origin}/tonconnect-manifest.json`,
};

onMounted(() => {
  if (window.Telegram && window.Telegram.WebApp) {
    const webApp = window.Telegram.WebApp;
    webApp.ready();
    webApp.expand();
    userInfo.value = webApp.initDataUnsafe.user;
  }
});
</script>

<style>
body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica,
    Arial, sans-serif;
  margin: 0;
  padding: 16px;
  color: var(--tg-theme-text-color, #000000);
  background-color: var(--tg-theme-bg-color, #ffffff);
}

.container {
  max-width: 390px;
  margin: 0 auto;
}

h1 {
  font-size: 24px;
  margin-bottom: 16px;
}

p {
  font-size: 16px;
  margin-bottom: 24px;
}

button {
  background-color: var(--tg-theme-button-color, #3390ec);
  color: var(--tg-theme-button-text-color, #ffffff);
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
}

button:active {
  opacity: 0.8;
}

.ton-connect-button {
  margin-top: 20px;
  margin-bottom: 20px;
}
</style>
