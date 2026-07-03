import { Stat } from "@/components/Stat";

export function StudentStats({
  activeTokens,
  payments,
  totalSpent,
}: {
  activeTokens: number;
  payments: number;
  totalSpent: number;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
      <Stat label="Active Tokens" value={activeTokens} />
      <Stat label="Payments" value={payments} />
      <Stat label="Total Spent" value={`৳${totalSpent}`} />
    </div>
  );
}