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
const currentNetwork = ref<"mainnet" | "testnet">("testnet");
const showInfoPanel = ref(false);

const TRANSACTION_ADDRESS =
  "0:4d240b7c6c52c58f68a0d4d648a0c107996695534c96fbf1c95a9e6552203482";

let myAppExplorerService: MyAppExplorerService;
let publicClient: PublicClient;
let tonAddress: any;

function nanoTONsToTONs(nanoTONs: bigint): string {
  return (Number(nanoTONs) / 1e9).toFixed(2);
}

function toUserFriendlyAddress(address: string): string {
  try {
    return tonAddress.parseRaw(address).toString();
  } catch (error) {
    console.error("Error converting address:", error);
    return address;
  }
}

watch(walletAddress, async (newAddress) => {
  if (newAddress && publicClient) {
    try {
      walletBalance.value =
        (await publicClient.getBalance({
          address: newAddress,
        })) ?? 0n;
    } catch (error) {
      console.error("Failed to fetch wallet balance:", error);
      walletBalance.value = 0n;
    }
  } else {
    walletBalance.value = 0n;
  }
});

async function initializePublicClient() {
  try {
    const fotonCore = await import("@fotonjs/core");

    publicClient = fotonCore.createPublicClient({
      api: currentNetwork.value,
      authToken: config.public.tonCenterAuthToken,
    });
  } catch (error) {
    console.error("Failed to load @fotonjs/core:", error);
  }
}

onMounted(async () => {
  myAppExplorerService = new MyAppExplorerService("/api");
  console.log("Buffer is available:", typeof Buffer !== "undefined");

  await initializePublicClient();

  const { Address } = await import("ton");
  tonAddress = Address;
});

function toggleInfoPanel() {
  showInfoPanel.value = !showInfoPanel.value;
}

async function toggleNetwork() {
  if (sendingBet.value) {
    alert(
      "Please wait for the current transaction to complete before switching networks."
    );
    return;
  }

  const newNetwork = currentNetwork.value === "mainnet" ? "testnet" : "mainnet";

  const confirmSwitch = confirm(
    `Are you sure you want to switch to ${newNetwork}? This will disconnect your wallet.`
  );
  if (!confirmSwitch) return;

  currentNetwork.value = newNetwork;
  await initializePublicClient();

  if (connector[0].connected) {
    await connector[0].disconnect();
  }

  walletBalance.value = 0n;
  amount.value = "";
  result.value = "";
  walletAddress.value = "";

  console.log(`Switched to ${newNetwork}. Wallet disconnected.`);
}

async function sendTransaction() {
  const transaction = {
    validUntil: Math.floor(Date.now() / 1000) + 360, // 6 minutes from now
    messages: [
      {
        address: TRANSACTION_ADDRESS,
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

const resultClass = computed(() => ({
  "bg-green-100 text-green-800": result.value === "win",
  "bg-red-100 text-red-800": result.value === "lose",
}));

const resultEmoji = computed(() => (result.value === "win" ? "🎉" : "😢"));

const resultText = computed(() =>
  result.value === "win" ? "You won!" : "You lost!"
);
</script>

<template>
  <UContainer
    class="flex flex-col items-center justify-center min-h-screen p-4 md:p-6 gap-6"
  >
    <div class="flex flex-col items-center w-full max-w-md mb-4">
      <div class="flex justify-between items-center w-full mb-2">
        <TonConnectButton class="w-full md:w-auto" />
        <UButton
          @click="toggleNetwork"
          size="sm"
          :color="currentNetwork === 'mainnet' ? 'green' : 'blue'"
          class="ml-2"
        >
          {{ currentNetwork === "mainnet" ? "Mainnet" : "Testnet" }}
        </UButton>
        <UButton @click="toggleInfoPanel" size="sm" color="gray" class="ml-2">
          {{ showInfoPanel ? "Hide Info" : "Show Info" }}
        </UButton>
      </div>

      <transition name="fade">
        <div
          v-if="showInfoPanel"
          class="w-full mt-2 p-2 bg-gray-100 rounded-md text-sm"
        >
          <p>
            <strong>Wallet Address:</strong>
            {{ walletAddress || "Not connected" }}
          </p>
          <p>
            <strong>Destination Address:</strong>
            {{ toUserFriendlyAddress(TRANSACTION_ADDRESS) }}
          </p>
        </div>
      </transition>
    </div>

    <div class="w-full max-w-md">
      <CoinSideSelection class="mb-6 w-full text-center" />

      <UInput
        v-model="amount"
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
        :color="transactionFailed ? 'red' : 'black'"
        :disabled="Number(amount) <= 0"
        :loading="sendingBet"
        @click="sendTransaction"
        size="xl"
        class="w-full mb-6 flex items-center justify-center"
      >
        <span class="text-center">
          {{ transactionFailed ? "Transaction Failed" : "Toss Coin" }}
        </span>
      </UButton>
    </div>

    <transition name="fade">
      <div
        v-if="result"
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
</style>
