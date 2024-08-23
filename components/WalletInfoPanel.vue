<script setup lang="ts">
import { TonService } from "~/services/tonService";

const props = defineProps<{
  walletAddress: string;
  currentNetwork: "mainnet" | "testnet";
  walletBalance: bigint;
}>();

const gameStore = useGameStore();

const infoItems = computed(() => [
  {
    label: "Wallet Address",
    icon: "i-heroicons-wallet",
    content: props.walletAddress || "Not connected",
  },
  {
    label: "Destination Address",
    icon: "i-heroicons-arrow-right-circle",
    content: `${TonService.toUserFriendlyAddress(gameStore.selectedAddress)} (${
      gameStore.selectedAddress
    })`,
  },
  {
    label: "Network",
    icon: "i-heroicons-globe-alt",
    content:
      props.currentNetwork.charAt(0).toUpperCase() +
      props.currentNetwork.slice(1),
  },
  {
    label: "Balance",
    icon: "i-heroicons-currency-dollar",
    content: `${TonService.nanoTONsToTONs(props.walletBalance)} TON`,
  },
]);
</script>

<template>
  <UCard class="w-full mt-2 text-sm">
    <template #header>
      <div class="flex items-center">
        <UIcon name="i-heroicons-information-circle" class="mr-2" />
        <h3 class="text-base font-semibold">Wallet Information</h3>
      </div>
    </template>

    <ul class="space-y-2">
      <li v-for="item in infoItems" :key="item.label" class="flex items-start">
        <UIcon :name="item.icon" class="mr-2 mt-1 flex-shrink-0" />
        <div>
          <p class="font-medium">{{ item.label }}</p>
          <p class="text-xs text-gray-500 break-all">
            {{ item.content }}
          </p>
        </div>
      </li>
    </ul>
  </UCard>
</template>
