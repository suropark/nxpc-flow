import { useQuery } from '@tanstack/react-query';
import { fetchRecentTransactions } from '../api/flow';
import { formatDistanceToNow } from 'date-fns';

export function TransactionList() {
  const { data: transactions, isLoading } = useQuery({
    queryKey: ['recentTransactions'],
    queryFn: fetchRecentTransactions,
  });

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-300">
          <thead>
            <tr>
              <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                Time
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Type
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                From
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                To
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Amount
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {transactions?.map((transaction) => (
              <tr key={transaction.id}>
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-500 sm:pl-6">
                  {formatDistanceToNow(new Date(transaction.timestamp), { addSuffix: true })}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm">
                  <span
                    className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                      transaction.type === 'inflow' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {transaction.type}
                  </span>
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {transaction.from.slice(0, 6)}...{transaction.from.slice(-4)}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {transaction.to.slice(0, 6)}...{transaction.to.slice(-4)}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{transaction.value} NXPC</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
