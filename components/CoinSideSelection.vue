<script setup lang="ts">
const gameStore = useGameStore();
</script>

<template>
  <UButton
    :icon="
      gameStore.selectedSide === 'heads'
        ? 'mingcute:copper-coin-line'
        : 'mingcute:currency-bitcoin-line'
    "
    :label="gameStore.selectedSide === 'heads' ? 'Heads' : 'Tails'"
    size="lg"
    color="yellow"
    @click="gameStore.toggleCoinSide"
  />
</template>
