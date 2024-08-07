<template>
  <UContainer class="py-8 flex justify-center">
    <UCard>
      <template #header>
        <div class="text-center">
          <h1 v-if="userInfo" class="text-2xl font-bold mb-4">
            Hello, {{ userInfo.first_name }}!
          </h1>
          <h1 v-else class="text-2xl font-bold mb-4">Welcome, Guest!</h1>
          <div v-if="userInfo" class="mt-2">
            <p>Username: {{ userInfo.username || "Not available" }}</p>
            <p>Language: {{ userInfo.language_code }}</p>
            <p>Is Premium: {{ userInfo.is_premium ? "Yes" : "No" }}</p>
          </div>
        </div>
      </template>
      <div class="flex justify-center">
        <TonConnectButton />
      </div>
      <template #footer>
        <div v-if="wallet" class="flex flex-col items-center">
          <p>Address: {{ tonAddress }}</p>
          <p>Chain: {{ wallet.account.chain }}</p>
          <p>Provider: {{ wallet.provider }}</p>
          <p>Device: {{ wallet.device.platform }}</p>
          <UButton @click="sendTransaction"> Send Transaction </UButton>
        </div>
        <p v-else>Please connect your wallet</p>
      </template>
    </UCard>
  </UContainer>
</template>

<script setup>
import { onMounted, ref } from "vue";
import {
  TonConnectButton,
  useTonWallet,
  useTonAddress,
  useTonConnectUI,
} from "@townsquarelabs/ui-vue";

const transaction = {
  messages: [
    {
      address:
        "0:412410771DA82CBA306A55FA9E0D43C9D245E38133CB58F1457DFB8D5CD8892F", // destination address
      amount: "20000", //Toncoin in nanotons
    },
  ],
};

const userInfo = ref(null);
const wallet = useTonWallet();
const tonAddress = useTonAddress();
const connector = useTonConnectUI();

onMounted(() => {
  if (window.Telegram && window.Telegram.WebApp) {
    const webApp = window.Telegram.WebApp;
    webApp.ready();
    webApp.expand();
    userInfo.value = webApp.initDataUnsafe.user;
  }
});

function sendTransaction() {
  connector[0].sendTransaction(transaction);
}
</script>
