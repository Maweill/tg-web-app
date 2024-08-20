<script setup lang="ts">
import { TonConnectButton } from "@townsquarelabs/ui-vue";
import { useWallet } from "~/composables/useWallet";
import { MyAppExplorerService } from "~/services/MyAppExplorerService";
import { TonService } from "~/services/tonService";
import { TRANSACTION_ADDRESS } from "~/utils/constants";
import type { PublicClient } from "@fotonjs/core";

const {
  walletAddress,
  walletBalance,
  currentNetwork,
  initializePublicClient,
  toggleNetwork,
  sendTransaction,
} = useWallet();

const gameState = reactive({
  amount: "",
  result: "",
  sendingBet: false,
  transactionFailed: false,
});

const uiState = reactive({
  showInfoPanel: false,
});

let myAppExplorerService: MyAppExplorerService;
let publicClient: PublicClient;

onMounted(async () => {
  myAppExplorerService = new MyAppExplorerService("/api");
  console.log("Buffer is available:", typeof Buffer !== "undefined");
  publicClient = await initializePublicClient();
});

function toggleInfoPanel() {
  uiState.showInfoPanel = !uiState.showInfoPanel;
}

async function placeBet() {
  try {
    gameState.sendingBet = true;
    gameState.transactionFailed = false;
    const boc = await sendTransaction(gameState.amount, TRANSACTION_ADDRESS);
    const txHash = await myAppExplorerService.getTransactionHash(boc);

    await publicClient.waitForTransaction({ hash: txHash });
    console.log("Transaction sent successfully. Tx hash:", txHash);

    const randomOutcome = Math.random() < 0.5;
    gameState.result = randomOutcome ? "win" : "lose";
  } catch (error) {
    gameState.transactionFailed = true;
    console.error("Error sending transaction:", error);
  } finally {
    gameState.sendingBet = false;
  }
}

function setAmount(percentage: number) {
  const amountInNanoTONs =
    (walletBalance.value * BigInt(Math.floor(percentage * 100))) / 100n;
  gameState.amount = TonService.nanoTONsToTONs(amountInNanoTONs);
}

const balancePercentages = computed(() => ({
  five: TonService.nanoTONsToTONs((walletBalance.value * 5n) / 100n),
  twentyFive: TonService.nanoTONsToTONs((walletBalance.value * 25n) / 100n),
  fifty: TonService.nanoTONsToTONs((walletBalance.value * 50n) / 100n),
  seventyFive: TonService.nanoTONsToTONs((walletBalance.value * 75n) / 100n),
  hundred: TonService.nanoTONsToTONs(walletBalance.value),
}));

const resultClass = computed(() => ({
  "bg-green-100 text-green-800": gameState.result === "win",
  "bg-red-100 text-red-800": gameState.result === "lose",
}));

const resultEmoji = computed(() => (gameState.result === "win" ? "🎉" : "😢"));

const resultText = computed(() =>
  gameState.result === "win" ? "You won!" : "You lost!"
);
</script>

<template>
  <UContainer
    class="flex flex-col items-center justify-center min-h-screen p-4 md:p-6 gap-6"
  >
    <div class="flex flex-col items-center w-full max-w-md mb-4">
      <div class="flex justify-between items-center w-full mb-2">
        <UButton @click="toggleInfoPanel" size="sm" color="gray" class="ml-2">
          {{ uiState.showInfoPanel ? "Hide Info" : "Show Info" }}
        </UButton>
        <UButton
          @click="toggleNetwork"
          size="sm"
          :color="currentNetwork === 'mainnet' ? 'green' : 'blue'"
          class="ml-2"
        >
          {{ currentNetwork === "mainnet" ? "Mainnet" : "Testnet" }}
        </UButton>
        <TonConnectButton class="w-full md:w-auto" />
      </div>

      <transition name="fade">
        <WalletInfoPanel
          v-if="uiState.showInfoPanel"
          :wallet-address="walletAddress"
          :current-network="currentNetwork"
          :wallet-balance="walletBalance"
        />
      </transition>
    </div>

    <div class="w-full max-w-md">
      <CoinSideSelection class="mb-6 w-full text-center" />

      <UInput
        v-model="gameState.amount"
        size="xl"
        icon="iconoir:coins"
        placeholder="0.00002"
        class="mb-4"
      >
        <template #trailing>
          <span class="text-gray-500 dark:text-gray-400 text-sm">TON</span>
        </template>
      </UInput>

      <div class="grid grid-cols-2 gap-2 mb-6">
        <UButton
          @click="setAmount(0.05)"
          size="lg"
          color="white"
          variant="solid"
          class="w-full flex items-center justify-center"
        >
          <span class="text-center">5%: {{ balancePercentages.five }} TON</span>
        </UButton>
        <UButton
          @click="setAmount(0.25)"
          size="lg"
          color="white"
          variant="solid"
          class="w-full flex items-center justify-center"
        >
          <span class="text-center"
            >25%: {{ balancePercentages.twentyFive }} TON</span
          >
        </UButton>
        <UButton
          @click="setAmount(0.5)"
          size="lg"
          color="white"
          variant="solid"
          class="w-full flex items-center justify-center"
        >
          <span class="text-center"
            >50%: {{ balancePercentages.fifty }} TON</span
          >
        </UButton>
        <UButton
          @click="setAmount(0.75)"
          size="lg"
          color="white"
          variant="solid"
          class="w-full flex items-center justify-center"
        >
          <span class="text-center"
            >75%: {{ balancePercentages.seventyFive }} TON</span
          >
        </UButton>
        <UButton
          @click="setAmount(1)"
          size="lg"
          color="white"
          variant="solid"
          class="w-full col-span-2 flex items-center justify-center"
        >
          <span class="text-center"
            >100%: {{ balancePercentages.hundred }} TON</span
          >
        </UButton>
      </div>

      <UButton
        :color="gameState.transactionFailed ? 'red' : 'black'"
        :disabled="Number(gameState.amount) <= 0"
        :loading="gameState.sendingBet"
        @click="placeBet"
        size="xl"
        class="w-full mb-6 flex items-center justify-center"
      >
        <span class="text-center">
          {{ gameState.transactionFailed ? "Transaction Failed" : "Toss Coin" }}
        </span>
      </UButton>
    </div>

    <transition name="fade">
      <div
        v-if="gameState.result"
        class="text-center p-6 rounded-lg shadow-lg"
        :class="resultClass"
      >
        <p class="text-4xl mb-2">{{ resultEmoji }}</p>
        <p class="text-xl font-bold">{{ resultText }}</p>
      </div>
    </transition>
  </UContainer>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 640px) {
  .UCard {
    padding: 0.5rem;
  }

  ul {
    padding-left: 0;
  }

  li {
    margin-bottom: 0.75rem;
  }
}
</style>
