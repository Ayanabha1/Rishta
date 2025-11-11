import { ArrowUpRight } from "lucide-react";

interface Transaction {
  date: string;
  amount?: number;
  points?: number;
  status: string;
}

interface RecentTransactionsProps {
  transactions: Transaction[];
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  console.log(transactions);
  return (
    <div className="relative glassmorphic-card shadow-md rounded-2xl bg-white/10 backdrop-blur-md p-4 h-full overflow-hidden flex flex-col">
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <h3 className="text-lg font-semibold text-purple-950">
          Recent Transactions
        </h3>
        <button className="rounded-full p-2 hover:bg-white/20 transition-colors">
          <ArrowUpRight className="h-5 w-5 text-purple-900" />
        </button>
      </div>
      <ul className="space-y-2 overflow-y-scroll flex-1 min-h-0">
        {transactions?.length > 0 ? (
          transactions?.map((transaction, i) => (
            <li key={i} className="flex items-start justify-between text-sm">
              <div>
                <p className="font-medium text-purple-900">
                  {transaction.status || "Pending"}
                </p>
                <p className="text-purple-700">
                  {transaction.date || "2025-05-03"}
                </p>
              </div>
              <span className="font-semibold text-purple-950">
                {transaction.amount
                  ? `₹${transaction.amount.toLocaleString()}`
                  : `+${transaction.points} points`}
              </span>
            </li>
          ))
        ) : (
          <p>No transactions found</p>
        )}
      </ul>
    </div>
  );
}
