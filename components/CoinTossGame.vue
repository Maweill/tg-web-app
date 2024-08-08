<script setup lang="ts">
import { useTonConnectUI, TonConnectButton } from "@townsquarelabs/ui-vue";
import { MyAppExplorerService } from "~/services/MyAppExplorerService";

const connector = useTonConnectUI();
const amount = ref("");
const result = ref("");
const sendingBet = ref(false);
const transactionFailed = ref(false);

let myAppExplorerService: MyAppExplorerService;
onMounted(() => {
  myAppExplorerService = new MyAppExplorerService("/api");
});

async function sendTransaction() {
  const transaction = {
    validUntil: Math.floor(Date.now() / 1000) + 360, // 6 minutes from now
    messages: [
      {
        address:
          "0:412410771DA82CBA306A55FA9E0D43C9D245E38133CB58F1457DFB8D5CD8892F", // destination address
        amount: (parseFloat(amount.value) * 1e9).toString(), // converting to nanotons
      },
    ],
  };
  try {
    sendingBet.value = true;
    transactionFailed.value = false;
    const { boc } = await connector[0].sendTransaction(transaction);
    const someTxData = await myAppExplorerService.getTransaction(boc);
    console.log("Transaction sent successfully. Tx:", someTxData);

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
    <p v-if="result == 'win'">You won!</p>
    <p v-else-if="result == 'lose'">You lost!</p>
  </UContainer>
</template>
