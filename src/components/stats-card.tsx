import { ArrowUpRight } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string;
  totalEarnings?: number;
  subtitle?: string;
  showAvatars?: boolean;
  showChart?: boolean;
  icon?: React.ReactNode;
}

export function StatsCard({
  title,
  value,
  totalEarnings,
  subtitle,
  showAvatars,
  showChart,
  icon,
}: StatsCardProps) {
  return (
    <div className="relative glassmorphic-card overflow-hidden shadow-md rounded-2xl bg-white/10 backdrop-blur-md p-4">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-purple-950">{title}</h3>
          <div className="flex items-center gap-2">
            <h3 className="text-4xl font-bold text-purple-950 flex items-center gap-2">
              {icon}
              {value}
            </h3>
            {subtitle && (
              <span className="text-sm text-purple-800">{subtitle}</span>
            )}
          </div>
          {totalEarnings && (
            <p className="text-sm text-purple-800">
              Last 12 months: ₹{totalEarnings.toLocaleString()}
            </p>
          )}
        </div>
        <button className="rounded-full p-2 hover:bg-white/20 transition-colors">
          <ArrowUpRight className="h-5 w-5 text-purple-900" />
        </button>
      </div>

      {showAvatars && (
        <div className="mt-4 flex -space-x-2">
          <img
            src="/placeholder.svg?height=32&width=32"
            alt="Avatar 1"
            className="h-8 w-8 rounded-full border-2 border-white"
          />
          <img
            src="/placeholder.svg?height=32&width=32"
            alt="Avatar 2"
            className="h-8 w-8 rounded-full border-2 border-white"
          />
          <img
            src="/placeholder.svg?height=32&width=32"
            alt="Avatar 3"
            className="h-8 w-8 rounded-full border-2 border-white"
          />
        </div>
      )}

      {showChart && (
        <div className="mt-4 flex items-end gap-1 h-8">
          {[40, 70, 45, 30, 90, 55, 70, 80].map((height, i) => (
            <div
              key={i}
              className="w-2 bg-purple-700 rounded-full"
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
