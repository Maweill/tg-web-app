<script setup lang="ts">
import { TonConnectButton } from "@townsquarelabs/ui-vue";
import { useWallet } from "~/composables/useWallet";
import { MyAppExplorerService } from "~/services/MyAppExplorerService";
import { CoinTossService } from "~/services/CoinTossService";
import { useGameStore } from "~/stores/gameStore";
import { initMiniApp } from "@telegram-apps/sdk";

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

const coinTossService = new CoinTossService(
  publicClient,
  myAppExplorerService,
  sendTransaction
);

const gameStore = useGameStore();
const [miniApp] = initMiniApp();

watch(walletBalance, () => {
  coinTossService.calculateBalancePercentages(walletBalance.value);
});

function toggleInfoPanel() {
  uiState.showInfoPanel = !uiState.showInfoPanel;
}

function sendMessageToBot() {
  const amount = Number(gameStore.amount).toFixed(2);
  const message = `cointoss ${amount} TON`;

  try {
    miniApp.sendData(message);
  } catch (error) {
    console.error("Error when sending message:", error);
  }
}

const betHistoryStore = useBetHistoryStore();

async function placeBet() {
  sendMessageToBot();
  const bet = await coinTossService.placeBet();

  if (bet) {
    betHistoryStore.addBet({
      amount: Number(gameStore.amount),
      result: bet.result,
      timestamp: new Date().toISOString(),
      network: currentNetwork.value,
      transactionHash: bet.txHash,
    });
    await betHistoryStore.saveBetsToCloud();
  }
}

onMounted(async () => {
  miniApp.ready();
  await betHistoryStore.loadBetsFromCloud();
});
</script>

<template>
  <UContainer
    class="flex flex-col items-center justify-center min-h-screen p-4 md:p-6 gap-6"
  >
    <div
      v-if="!walletAddress"
      class="flex justify-center items-center w-full h-full"
    >
      <TonConnectButton class="scale-150 m-5" />
    </div>
    <template v-else>
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
        <AddressManager class="mb-6" />
      </div>

      <div class="w-full max-w-md">
        <CoinSideSelection class="mb-6 w-full text-center" />

        <UInput
          v-model="gameStore.amount"
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
            @click="gameStore.setAmount(0.05, walletBalance)"
            size="lg"
            color="white"
            variant="solid"
            class="w-full flex items-center justify-center"
          >
            <span class="text-center"
              >5%: {{ gameStore.balancePercentages.five }} TON</span
            >
          </UButton>
          <UButton
            @click="gameStore.setAmount(0.25, walletBalance)"
            size="lg"
            color="white"
            variant="solid"
            class="w-full flex items-center justify-center"
          >
            <span class="text-center"
              >25%: {{ gameStore.balancePercentages.twentyFive }} TON</span
            >
          </UButton>
          <UButton
            @click="gameStore.setAmount(0.5, walletBalance)"
            size="lg"
            color="white"
            variant="solid"
            class="w-full flex items-center justify-center"
          >
            <span class="text-center"
              >50%: {{ gameStore.balancePercentages.fifty }} TON</span
            >
          </UButton>
          <UButton
            @click="gameStore.setAmount(0.75, walletBalance)"
            size="lg"
            color="white"
            variant="solid"
            class="w-full flex items-center justify-center"
          >
            <span class="text-center"
              >75%: {{ gameStore.balancePercentages.seventyFive }} TON</span
            >
          </UButton>
          <UButton
            @click="gameStore.setAmount(1, walletBalance)"
            size="lg"
            color="white"
            variant="solid"
            class="w-full col-span-2 flex items-center justify-center"
          >
            <span class="text-center"
              >100%: {{ gameStore.balancePercentages.hundred }} TON</span
            >
          </UButton>
        </div>

        <UButton
          :color="gameStore.transactionFailed ? 'red' : 'black'"
          :disabled="Number(gameStore.amount) <= 0"
          :loading="gameStore.sendingBet"
          @click="placeBet"
          size="xl"
          class="w-full mb-6 flex items-center justify-center"
        >
          <span class="text-center">
            {{
              gameStore.transactionFailed ? "Transaction Failed" : "Toss Coin"
            }}
          </span>
        </UButton>
      </div>

      <transition name="fade">
        <div
          v-if="gameStore.result"
          class="text-center p-6 rounded-lg shadow-lg"
          :class="gameStore.resultClass"
        >
          <p class="text-4xl mb-2">{{ gameStore.resultEmoji }}</p>
          <p class="text-xl font-bold">{{ gameStore.resultText }}</p>
        </div>
      </transition>
    </template>
  </UContainer>
  <BetHistory v-if="walletAddress" />
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
