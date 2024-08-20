import { Address } from "ton";
import { NANOTONS_IN_TON } from "~/utils/constants";

export class TonService {
  static toUserFriendlyAddress(address: string): string {
    try {
      return Address.parseRaw(address).toString();
    } catch (error) {
      console.error("Error converting address:", error);
      return address;
    }
  }

  static toRawAddress(address: string): string {
    try {
      return Address.parseFriendly(address).address.toRawString();
    } catch (error) {
      console.error("Error converting address to raw format:", error);
      return address;
    }
  }

  static nanoTONsToTONs(nanoTONs: bigint): string {
    return (Number(nanoTONs) / NANOTONS_IN_TON).toFixed(2);
  }

  static TONsToNanoTONs(tons: number): bigint {
    return BigInt(Math.floor(tons * NANOTONS_IN_TON));
  }
}
