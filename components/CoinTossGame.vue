<script setup lang="ts">
import type { PublicClient } from "@fotonjs/core";
import {
  useTonConnectUI,
  TonConnectButton,
  useTonAddress,
} from "@townsquarelabs/ui-vue";
import { MyAppExplorerService } from "~/services/MyAppExplorerService";

const config = useRuntimeConfig();

const connector = useTonConnectUI();
const amount = ref("");
const result = ref("");
const sendingBet = ref(false);
const transactionFailed = ref(false);
const walletAddress = useTonAddress();
const walletBalance = ref<bigint>(0n);

let myAppExplorerService: MyAppExplorerService;
let publicClient: PublicClient;

function nanoTONsToTONs(nanoTONs: bigint): string {
  return (Number(nanoTONs) / 1e9).toFixed(2);
}

onMounted(async () => {
  myAppExplorerService = new MyAppExplorerService("/api");
  console.log("Buffer is available:", typeof Buffer !== "undefined");

  try {
    const fotonCore = await import("@fotonjs/core");

    publicClient = fotonCore.createPublicClient({
      api: "testnet",
      authToken: config.public.tonCenterAuthToken,
    });
    walletBalance.value =
      (await publicClient.getBalance({
        address: walletAddress.value,
      })) ?? 0n;
  } catch (error) {
    console.error("Failed to load @fotonjs/core:", error);
  }
});

async function sendTransaction() {
  const transaction = {
    validUntil: Math.floor(Date.now() / 1000) + 360, // 6 minutes from now
    messages: [
      {
        address:
          "0:4d240b7c6c52c58f68a0d4d648a0c107996695534c96fbf1c95a9e6552203482",
        amount: (parseFloat(amount.value) * 1e9).toString(), // converting to nanotons
      },
    ],
  };
  try {
    sendingBet.value = true;
    transactionFailed.value = false;
    const { boc } = await connector[0].sendTransaction(transaction);
    const txHash = await myAppExplorerService.getTransactionHash(boc);

    const tx = await publicClient.waitForTransaction({
      hash: txHash,
    });
    console.log("Transaction sent successfully. Tx:", tx);

    const randomOutcome = Math.random() < 0.5;
    result.value = randomOutcome ? "win" : "lose";
  } catch (error) {
    transactionFailed.value = true;
    console.error("Error sending transaction:", error);
  } finally {
    sendingBet.value = false;
  }
}

function setAmount(percentage: number) {
  const amountInNanoTONs =
    (walletBalance.value * BigInt(Math.floor(percentage * 100))) / 100n;
  amount.value = nanoTONsToTONs(amountInNanoTONs);
}

const balancePercentages = computed(() => {
  return {
    five: nanoTONsToTONs((walletBalance.value * 5n) / 100n),
    twentyFive: nanoTONsToTONs((walletBalance.value * 25n) / 100n),
    fifty: nanoTONsToTONs((walletBalance.value * 50n) / 100n),
    seventyFive: nanoTONsToTONs((walletBalance.value * 75n) / 100n),
    hundred: nanoTONsToTONs(walletBalance.value),
  };
});
</script>

<template>
  <UContainer
    class="flex flex-col items-center justify-center min-h-screen gap-6"
  >
    <TonConnectButton />
    <CoinSideSelection />
    <UInput
      v-model="amount"
      size="lg"
      icon="iconoir:coins"
      placeholder="0.00002"
    >
      <template #trailing>
        <span class="text-gray-500 dark:text-gray-400 text-xs">TON</span>
      </template>
    </UInput>
    <div class="flex flex-wrap justify-center gap-2">
      <UButton @click="setAmount(0.05)" size="sm"
        >5%: {{ balancePercentages.five }} TON</UButton
      >
      <UButton @click="setAmount(0.25)" size="sm"
        >25%: {{ balancePercentages.twentyFive }} TON</UButton
      >
      <UButton @click="setAmount(0.5)" size="sm"
        >50%: {{ balancePercentages.fifty }} TON</UButton
      >
      <UButton @click="setAmount(0.75)" size="sm"
        >75%: {{ balancePercentages.seventyFive }} TON</UButton
      >
      <UButton @click="setAmount(1)" size="sm"
        >100%: {{ balancePercentages.hundred }} TON</UButton
      >
    </div>
    <UButton
      :color="transactionFailed ? 'red' : 'primary'"
      :disabled="Number(amount) <= 0"
      :loading="sendingBet"
      @click="sendTransaction"
    >
      {{ transactionFailed ? "Transaction Failed" : "Send Transaction" }}
    </UButton>
    <UDivider icon="material-symbols:arrow-downward-rounded" />
    <p v-if="result == 'win'">🎉 You won! 🏆</p>
    <p v-else-if="result == 'lose'">😢 You lost! 💔</p>
  </UContainer>
</template>
