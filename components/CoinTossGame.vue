<script setup lang="ts">
import { TonConnectButton } from "@townsquarelabs/ui-vue";
import { useWallet } from "~/composables/useWallet";
import { useCoinToss } from "~/composables/useCoinToss";
import { MyAppExplorerService } from "~/services/MyAppExplorerService";

const {
  walletAddress,
  walletBalance,
  currentNetwork,
  initializePublicClient,
  toggleNetwork,
  sendTransaction,
} = useWallet();

const uiState = reactive({
  showInfoPanel: false,
});

const myAppExplorerService = new MyAppExplorerService("/api");
const publicClient = await initializePublicClient();

const {
  gameState,
  placeBet,
  setAmount,
  balancePercentages,
  resultClass,
  resultEmoji,
  resultText,
} = useCoinToss(
  walletBalance,
  sendTransaction,
  publicClient,
  myAppExplorerService
);

function toggleInfoPanel() {
  uiState.showInfoPanel = !uiState.showInfoPanel;
}
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
