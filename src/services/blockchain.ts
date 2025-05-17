import { createPublicClient, http, parseAbi, getContract, zeroAddress, type PublicClient } from 'viem';
import { avalanche } from 'viem/chains';
import { NXPC_TOKEN_ADDRESS, AVALANCHE_RPC_URL, NXPC_DEPLOYED_BLOCK, BRIDGE_TOKENS_ABI, NXPC_BRIDGE_ADDRESS } from '../config/constants';
import type { Transaction } from '../types';
import { saveEvents, getLastSyncedBlock, updateLastSyncedBlock } from './transaction';

const client: PublicClient = createPublicClient({
  chain: avalanche,
  transport: http(AVALANCHE_RPC_URL),
});

// Cache for block timestamps to avoid redundant RPC calls
const blockTimestampCache = new Map<number, number>();

async function getBlockTimestamp(blockNumber: number): Promise<number> {
  // Check cache first
  const cachedTimestamp = blockTimestampCache.get(blockNumber);
  if (cachedTimestamp) {
    return cachedTimestamp;
  }

  // Fetch block timestamp from blockchain
  const block = await client.getBlock({ blockNumber: BigInt(blockNumber) });
  const timestamp = Number(block.timestamp);

  // Cache the result
  blockTimestampCache.set(blockNumber, timestamp);
  return timestamp;
}

export async function getLatestBlockNumber(): Promise<number> {
  const block = await client.getBlock();
  return Number(block.number);
}

export async function getPastBridgeEvents(fromBlock: bigint, toBlock: bigint): Promise<Transaction[]> {
  try {
    const events = await client.getLogs({
      address: NXPC_BRIDGE_ADDRESS,
      events: BRIDGE_TOKENS_ABI,
      fromBlock,
      toBlock,
    });

    // Process events in parallel with Promise.all
    const transactions = await Promise.all(
      events.map(async (event) => {
        const blockNumber = Number(event.blockNumber);
        const timestamp = await getBlockTimestamp(blockNumber);

        return {
          id: event.transactionHash,
          hash: event.transactionHash,
          from: event.eventName === 'MintBridgeTokens' ? zeroAddress : event.args.sender || zeroAddress,
          to: event.args.recipient || zeroAddress,
          value: event.args.amount?.toString() || '0',
          timestamp,
          type: event.eventName === 'MintBridgeTokens' ? 'outflow' : 'inflow',
          blockNumber,
        };
      })
    );

    return transactions as Transaction[];
  } catch (error) {
    console.error('Error fetching past bridge events:', error);
    throw error;
  }
}

export async function fetchHistoricalData() {
  const currentBlock = await getLatestBlockNumber();
  const lastSyncedBlock = await getLastSyncedBlock();
  const fromBlock = BigInt(lastSyncedBlock || NXPC_DEPLOYED_BLOCK);
  const toBlock = BigInt(currentBlock);

  if (fromBlock >= toBlock) {
    console.log('Already up to date');
    return;
  }

  // Process blocks in batches of 1000
  const BATCH_SIZE = 1000n;
  let currentFromBlock = fromBlock;

  while (currentFromBlock < toBlock) {
    const currentToBlock = currentFromBlock + BATCH_SIZE > toBlock ? toBlock : currentFromBlock + BATCH_SIZE;

    console.log(`Fetching blocks ${currentFromBlock} to ${currentToBlock}`);

    try {
      const bridgeEvents = await getPastBridgeEvents(currentFromBlock, currentToBlock);
      console.log(`Found ${bridgeEvents.length} bridge events`);

      if (bridgeEvents.length > 0) {
        await saveEvents(bridgeEvents);
        console.log(`Saved ${bridgeEvents.length} events to database`);
      }

      // Update sync block only if no errors occurred
      await updateLastSyncedBlock(Number(currentToBlock));
    } catch (error) {
      console.error(`Error processing blocks ${currentFromBlock} to ${currentToBlock}:`, error);
      // Skip sync block update for this batch and continue with next batch
    }

    currentFromBlock = currentToBlock + 1n;
  }
}
