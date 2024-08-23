import { defineStore } from "pinia";
import { TonService } from "~/services/tonService";
import { getAddressesFromStorage } from "~/utils/storage";

export const useGameStore = defineStore("game", {
  state: () => ({
    amount: "",
    result: "",
    sendingBet: false,
    transactionFailed: false,
    selectedSide: "heads",
    balancePercentages: {
      five: "0",
      twentyFive: "0",
      fifty: "0",
      seventyFive: "0",
      hundred: "0",
    },
    savedAddresses: {
      Default: TRANSACTION_ADDRESS,
      ...getAddressesFromStorage(),
    },
    selectedAddress: TRANSACTION_ADDRESS,
  }),
  actions: {
    setAmount(percentage: number, walletBalance: bigint) {
      const amountInNanoTONs =
        (walletBalance * BigInt(Math.floor(percentage * 100))) / 100n;
      this.amount = TonService.nanoTONsToTONs(amountInNanoTONs);
    },
    toggleCoinSide() {
      this.selectedSide = this.selectedSide === "heads" ? "tails" : "heads";
    },
    resetGame() {
      this.amount = "";
      this.result = "";
      this.sendingBet = false;
      this.transactionFailed = false;
    },
    setSendingBet(value: boolean) {
      this.sendingBet = value;
    },
    setTransactionFailed(value: boolean) {
      this.transactionFailed = value;
    },
    setResult(value: string) {
      this.result = value;
    },
    setBalancePercentages(percentages: typeof this.balancePercentages) {
      this.balancePercentages = percentages;
    },
    addAddress(name: string, address: string) {
      this.savedAddresses[name] = address;
      saveAddressesToStorage(this.savedAddresses);
    },
    removeAddress(name: string) {
      if (name !== "Default") {
        delete this.savedAddresses[name];
        saveAddressesToStorage(this.savedAddresses);
      }
    },
    setSelectedAddress(address: string) {
      this.selectedAddress = address;
    },
  },
  getters: {
    resultClass(): object {
      return {
        "bg-green-100 text-green-800": this.result === "win",
        "bg-red-100 text-red-800": this.result === "lose",
      };
    },
    resultEmoji(): string {
      return this.result === "win" ? "🎉" : "😢";
    },
    resultText(): string {
      return this.result === "win" ? "You won!" : "You lost!";
    },
  },
});
