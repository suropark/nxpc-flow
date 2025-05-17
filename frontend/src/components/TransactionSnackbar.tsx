import { useEffect, useState } from 'react';
import { createPublicClient, http, type PublicClient } from 'viem';
import { avalanche } from 'viem/chains';
import { BRIDGE_TOKENS_ABI, NXPC_BRIDGE_ADDRESS } from '../config/constants';
import { formatAmount, formatAddress } from '../utils/format';
import { ExternalLink } from 'lucide-react';
import { cn } from '../lib/utils';

interface Transaction {
  hash: string;
  type: 'inflow' | 'outflow';
  amount: string;
  from: string;
  to: string;
}

// Mock transactions for testing
const MOCK_TRANSACTIONS: Transaction[] = [
  {
    hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    type: 'inflow',
    amount: '1000000000000000000000', // 1000 NXPC
    from: '0x1234567890123456789012345678901234567890',
    to: '0x0987654321098765432109876543210987654321',
  },
  {
    hash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
    type: 'outflow',
    amount: '500000000000000000000', // 500 NXPC
    from: '0x0987654321098765432109876543210987654321',
    to: '0x1234567890123456789012345678901234567890',
  },
];

const client: PublicClient = createPublicClient({
  chain: avalanche,
  transport: http(),
});

interface TransactionSnackbarProps {
  isTestMode?: boolean;
}

export function TransactionSnackbar({ isTestMode = false }: TransactionSnackbarProps) {
  const [latestTx, setLatestTx] = useState<Transaction | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [mockIndex, setMockIndex] = useState(0);

  useEffect(() => {
    if (isTestMode) {
      // Test mode: Show mock transactions every 3 seconds
      const interval = setInterval(() => {
        const mockTx = MOCK_TRANSACTIONS[mockIndex];
        setLatestTx(mockTx);
        setIsVisible(true);
        setMockIndex((prev) => (prev + 1) % MOCK_TRANSACTIONS.length);

        setTimeout(() => {
          setIsVisible(false);
        }, 5000);
      }, 3000);

      return () => clearInterval(interval);
    }

    // Real mode: Watch blockchain events
    const unwatch = client.watchEvent({
      address: NXPC_BRIDGE_ADDRESS,
      events: BRIDGE_TOKENS_ABI,
      onLogs: (logs) => {
        console.log(logs, 'logs');
        const latestLog = logs[logs.length - 1];
        if (!latestLog) return;

        const transaction: Transaction = {
          hash: latestLog.transactionHash,
          type: latestLog.eventName === 'MintBridgeTokens' ? 'outflow' : 'inflow',
          amount: latestLog.args.amount?.toString() || '0',
          from: latestLog.eventName === 'MintBridgeTokens' ? 'Bridge' : latestLog.args.sender || '',
          to: latestLog.args.recipient || '',
        };

        setLatestTx(transaction);
        setIsVisible(true);

        setTimeout(() => {
          //   setIsVisible(false);
        }, 5000);
      },
    });

    return () => {
      unwatch();
    };
  }, [isTestMode, mockIndex]);

  if (!latestTx || !isVisible) return null;

  return (
    <div
      className={cn(
        'fixed top-4 left-1/2 -translate-x-1/2 z-50',
        'bg-white rounded-lg shadow-lg p-4',
        'border border-gray-200',
        'animate-in slide-in-from-top-5 duration-300'
      )}
    >
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium',
                latestTx.type === 'inflow' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
              )}
            >
              {latestTx.type === 'inflow' ? 'Inflow' : 'Outflow'}
            </span>
            <span className="text-sm font-medium">{formatAmount(latestTx.amount)} NXPC</span>
          </div>
          <div className="mt-1 text-xs text-gray-500">
            From: {formatAddress(latestTx.from)} → To: {formatAddress(latestTx.to)}
          </div>
        </div>
        <a
          href={`https://snowscan.xyz/tx/${latestTx.hash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center text-blue-600 hover:text-blue-800"
        >
          <ExternalLink className="h-4 w-4" />
          <span className="ml-1 text-sm">View</span>
        </a>
      </div>
    </div>
  );
}
