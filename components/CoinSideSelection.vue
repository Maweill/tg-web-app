<script setup lang="ts">
const heads = ref(true);

function toggleCoinSide() {
  heads.value = !heads.value;
}
</script>

<template>
  <UButton
    :icon="
      heads ? 'mingcute:copper-coin-line' : 'mingcute:currency-bitcoin-line'
    "
    :label="heads ? 'Heads' : 'Tails'"
    size="lg"
    @click="toggleCoinSide"
  />
</template>
