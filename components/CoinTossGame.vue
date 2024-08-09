<script setup lang="ts">
import { useTonConnectUI, TonConnectButton } from "@townsquarelabs/ui-vue";
import { MyAppExplorerService } from "~/services/MyAppExplorerService";

const config = useRuntimeConfig();

const connector = useTonConnectUI();
const amount = ref("");
const result = ref("");
const sendingBet = ref(false);
const transactionFailed = ref(false);

let myAppExplorerService: MyAppExplorerService;
let createPublicClient: any;

onMounted(async () => {
  myAppExplorerService = new MyAppExplorerService("/api");
  console.log("Buffer is available:", typeof Buffer !== "undefined");

  try {
    const fotonCore = await import("@fotonjs/core");
    createPublicClient = fotonCore.createPublicClient;
  } catch (error) {
    console.error("Failed to load @fotonjs/core:", error);
  }
});

async function sendTransaction() {
  if (!createPublicClient) {
    console.error("createPublicClient is not available");
    transactionFailed.value = true;
    return;
  }

  const transaction = {
    validUntil: Math.floor(Date.now() / 1000) + 360, // 6 minutes from now
    messages: [
      {
        address:
          "0:4d240b7c6c52c58f68a0d4d648a0c107996695534c96fbf1c95a9e6552203482", // destination address
        amount: (parseFloat(amount.value) * 1e9).toString(), // converting to nanotons
      },
    ],
  };
  try {
    sendingBet.value = true;
    transactionFailed.value = false;
    const { boc } = await connector[0].sendTransaction(transaction);
    const txHash = await myAppExplorerService.getTransactionHash(boc);
    console.log("auth token:", config.public.tonCenterAuthToken);

    const publicClient = createPublicClient({
      api: "testnet",
      authToken: config.public.tonCenterAuthToken,
    });
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
