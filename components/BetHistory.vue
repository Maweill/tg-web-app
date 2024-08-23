<script setup lang="ts">
import { useBetHistoryStore } from "~/stores/betHistoryStore";
import { initUtils } from "@telegram-apps/sdk";

const betHistoryStore = useBetHistoryStore();
const utils = initUtils();

const getResultIcon = (result: "win" | "lose") => {
  return result === "win"
    ? "i-heroicons-arrow-up-circle"
    : "i-heroicons-arrow-down-circle";
};

const getResultColor = (result: "win" | "lose") => {
  return result === "win" ? "text-green-600" : "text-red-600";
};

const getTonscanUrl = (
  network: "mainnet" | "testnet",
  transactionHash: string
) => {
  const baseUrl =
    network === "mainnet"
      ? "https://tonscan.org/tx/"
      : "https://testnet.tonscan.org/tx/";
  return `${baseUrl}${transactionHash}`;
};

const openTonscanLink = (
  network: "mainnet" | "testnet",
  transactionHash: string
) => {
  const url = getTonscanUrl(network, transactionHash);
  utils.openLink(url);
};
</script>

<template>
  <UContainer class="px-4 py-6 max-w-md mx-auto">
    <h2 class="text-xl font-bold mb-4">Bet History</h2>
    <div class="space-y-3">
      <UCard
        v-for="bet in betHistoryStore.bets"
        :key="bet.id"
        class="w-full cursor-pointer hover:shadow-md transition-shadow"
        @click="openTonscanLink(bet.network, bet.transactionHash)"
      >
        <div class="flex justify-between items-center">
          <div class="flex flex-col">
            <span class="text-sm text-gray-600">{{
              new Date(bet.timestamp).toLocaleString()
            }}</span>
            <span class="font-medium" :class="getResultColor(bet.result)">
              {{ bet.result === "win" ? "+" : "-" }}{{ bet.amount }} TON
            </span>
            <span class="text-xs text-gray-500">{{ bet.network }}</span>
          </div>
          <UIcon
            :name="getResultIcon(bet.result)"
            :class="[getResultColor(bet.result), 'w-6 h-6']"
          />
        </div>
      </UCard>
    </div>
  </UContainer>
</template>
