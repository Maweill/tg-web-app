import { TonClient, type NetworkConfig } from "@eversdk/core";

// Интерфейсы
interface Transaction {
  id: string;
  status: string;
  block: {
    workchain: number;
    shard: string;
    seqno: number;
  };
}

interface ParsedMessage {
  parsed: {
    id: string;
  };
}

export class MyAppExplorerService {
  private client: TonClient;

  constructor(endpoint: string) {
    this.client = new TonClient({
      network: {
        endpoints: [endpoint],
        message_retries_count: 5,
        message_processing_timeout: 30000,
        wait_for_timeout: 30000,
      } as NetworkConfig,
    });

    this.checkConnection();
  }

  private async checkConnection() {
    try {
      await this.client.net.query_collection({
        collection: "blocks",
        filter: {},
        result: "id",
        limit: 1,
      });
      console.log("Successfully connected to the network");
    } catch (error) {
      console.error("Failed to connect to the network:", error);
    }
  }

  async getTransactionHash(boc: string): Promise<string> {
    const cell: ParsedMessage = await this.client.boc.parse_message({
      boc: boc,
    });

    const hash: string = cell.parsed.id;
    return hash;
  }

  async getTransaction(boc: string): Promise<Transaction | null> {
    const cell: ParsedMessage = await this.client.boc.parse_message({
      boc: boc,
    });

    const hash: string = cell.parsed.id;

    return this.getTransactionByHash(hash);
  }

  async getTransactionByHash(hash: string): Promise<Transaction | null> {
    console.log(`Searching for transaction with hash: ${hash}`);

    try {
      const result = await this.client.net.query_collection({
        collection: "transactions",
        filter: { id: { eq: hash } },
        result: "id status block { workchain shard seqno }",
      });

      console.log(`Query result: ${JSON.stringify(result)}`);
      if (result.result.length === 0) {
        console.log(`No transaction found for hash: ${hash}`);
        return null;
      }

      console.log(`Transaction found: ${JSON.stringify(result.result[0])}`);
      return result.result[0] as Transaction;
    } catch (error) {
      console.error(`Error while searching for transaction:`, error);
      if (error instanceof Error) {
        console.error(`Error message: ${error.message}`);
        console.error(`Error stack: ${error.stack}`);
      }
      throw error;
    }
  }

  async trackTransaction(
    boc: string,
    maxAttempts: number = 10,
    interval: number = 5000
  ): Promise<Transaction | null> {
    let attempts = 0;
    const parsedMessage: ParsedMessage = await this.client.boc.parse_message({
      boc: boc,
    });
    const hash: string = parsedMessage.parsed.id;

    const checkStatus = async (): Promise<Transaction | null> => {
      attempts++;
      const tx = await this.getTransactionByHash(hash);

      if (tx) {
        console.log(`Transaction found. Status: ${tx.status}`);
        return tx;
      }

      if (attempts >= maxAttempts) {
        console.log("Max attempts reached. Transaction not found.");
        return null;
      }

      console.log(`Transaction not found. Attempt ${attempts}. Retrying...`);
      await new Promise((resolve) => setTimeout(resolve, interval));
      return checkStatus();
    };

    return checkStatus();
  }
}
