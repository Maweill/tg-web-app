import { TonService } from "~/services/tonService";
import { TRANSACTION_ADDRESS } from "~/utils/constants";
import type { PublicClient } from "@fotonjs/core";
import type { MyAppExplorerService } from "~/services/MyAppExplorerService";
import { useGameStore } from "~/stores/gameStore";

export class CoinTossService {
  constructor(
    private publicClient: PublicClient,
    private myAppExplorerService: MyAppExplorerService,
    private sendTransaction: (
      amount: string,
      address: string
    ) => Promise<string>
  ) {}

  async placeBet() {
    const gameStore = useGameStore();
    try {
      gameStore.setSendingBet(true);
      gameStore.setTransactionFailed(false);

      if (!gameStore.selectedAddress) {
        throw new Error("No address selected");
      }

      const rawAddress = TonService.toRawAddress(gameStore.selectedAddress);
      const boc = await this.sendTransaction(gameStore.amount, rawAddress);
      const txHash = await this.myAppExplorerService.getTransactionHash(boc);

      await this.publicClient.waitForTransaction({ hash: txHash });
      console.log("Transaction sent successfully. Tx hash:", txHash);

      const randomOutcome = Math.random() < 0.5;
      const result = randomOutcome ? "win" : "lose";
      gameStore.setResult(result);
      return result;
    } catch (error) {
      gameStore.setTransactionFailed(true);
      console.error("Error sending transaction:", error);
    } finally {
      gameStore.setSendingBet(false);
    }
  }

  calculateBalancePercentages(walletBalance: bigint) {
    const gameStore = useGameStore();
    gameStore.setBalancePercentages({
      five: TonService.nanoTONsToTONs((walletBalance * 5n) / 100n),
      twentyFive: TonService.nanoTONsToTONs((walletBalance * 25n) / 100n),
      fifty: TonService.nanoTONsToTONs((walletBalance * 50n) / 100n),
      seventyFive: TonService.nanoTONsToTONs((walletBalance * 75n) / 100n),
      hundred: TonService.nanoTONsToTONs(walletBalance),
    });
  }
}
