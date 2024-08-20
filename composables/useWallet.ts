import { ref, watch } from "vue";
import { useTonConnectUI, useTonAddress } from "@townsquarelabs/ui-vue";
import { createPublicClient, type PublicClient } from "@fotonjs/core";
import { TonService } from "~/services/tonService";

export function useWallet() {
  const connector = useTonConnectUI();
  const walletAddress = useTonAddress();
  const walletBalance = ref<bigint>(0n);
  const currentNetwork = ref<"mainnet" | "testnet">("testnet");
  let publicClient: PublicClient;

  watch(walletAddress, async (newAddress) => {
    if (newAddress && publicClient) {
      try {
        walletBalance.value =
          (await publicClient.getBalance({ address: newAddress })) ?? 0n;
      } catch (error) {
        console.error("Failed to fetch wallet balance:", error);
        walletBalance.value = 0n;
      }
    } else {
      walletBalance.value = 0n;
    }
  });

  async function initializePublicClient() {
    publicClient = createPublicClient({
      api: currentNetwork.value,
      authToken: useRuntimeConfig().public.tonCenterAuthToken,
    });
    return publicClient;
  }

  async function toggleNetwork() {
    const newNetwork =
      currentNetwork.value === "mainnet" ? "testnet" : "mainnet";
    currentNetwork.value = newNetwork;

    if (connector[0].connected) {
      await connector[0].disconnect();
    }

    walletBalance.value = 0n;
    walletAddress.value = "";

    console.log(`Switched to ${newNetwork}. Wallet disconnected.`);
  }

  async function sendTransaction(amount: string, address: string) {
    const transaction = {
      validUntil: Math.floor(Date.now() / 1000) + 360,
      messages: [
        {
          address,
          amount: TonService.TONsToNanoTONs(parseFloat(amount)).toString(),
        },
      ],
    };

    const { boc } = await connector[0].sendTransaction(transaction);
    return boc;
  }

  return {
    walletAddress,
    walletBalance,
    currentNetwork,
    initializePublicClient,
    toggleNetwork,
    sendTransaction,
  };
}
