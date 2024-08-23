import { initCloudStorage } from "@telegram-apps/sdk";

export interface Bet {
  id: number;
  amount: number;
  result: "win" | "lose";
  timestamp: string;
  network: "mainnet" | "testnet";
  transactionHash: string;
}

export const useBetHistoryStore = defineStore("betHistory", () => {
  const bets = ref<Bet[]>([]);
  const cloudStorage = initCloudStorage();

  function addBet(bet: Omit<Bet, "id">) {
    const newBet = { ...bet, id: Date.now() };
    bets.value.unshift(newBet);
  }

  async function saveBetsToCloud() {
    try {
      await cloudStorage.set("betHistory", JSON.stringify(bets.value));
      console.log("Bet history saved to cloud storage");
    } catch (error) {
      console.error("Error saving bet history to cloud storage:", error);
    }
  }

  async function loadBetsFromCloud() {
    try {
      const storedBets = await cloudStorage.get("betHistory");
      if (storedBets) {
        bets.value = JSON.parse(storedBets);
        console.log("Bet history loaded from cloud storage");
      }
    } catch (error) {
      console.error("Error loading bet history from cloud storage:", error);
    }
  }

  return { bets, addBet, saveBetsToCloud, loadBetsFromCloud };
});
