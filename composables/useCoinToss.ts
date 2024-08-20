import { reactive, computed } from "vue";
import { TonService } from "~/services/tonService";
import { MyAppExplorerService } from "~/services/MyAppExplorerService";
import { TRANSACTION_ADDRESS } from "~/utils/constants";
import type { PublicClient } from "@fotonjs/core";

export function useCoinToss(
  walletBalance: Ref<bigint>,
  sendTransaction: (amount: string, address: string) => Promise<string>,
  publicClient: PublicClient,
  myAppExplorerService: MyAppExplorerService
) {
  const gameState = reactive({
    amount: "",
    result: "",
    sendingBet: false,
    transactionFailed: false,
  });

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

  const resultEmoji = computed(() =>
    gameState.result === "win" ? "🎉" : "😢"
  );

  const resultText = computed(() =>
    gameState.result === "win" ? "You won!" : "You lost!"
  );

  return {
    gameState,
    placeBet,
    setAmount,
    balancePercentages,
    resultClass,
    resultEmoji,
    resultText,
  };
}
