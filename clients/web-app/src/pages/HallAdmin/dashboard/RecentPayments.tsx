import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import type { Payment } from "@/types";

export function RecentPayments({ payments }: { payments: Payment[] }) {
  const { role } = useAuth();
  const href = role === "HALL_STAFF" ? "/hallStaff/payments" : "/hallAdmin/payments";

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg">Recent payments</h3>
        <Link to={href} className="text-sm text-primary hover:underline">
          View all
        </Link>
      </div>
      <div className="space-y-3">
        {payments.length === 0 && (
          <div className="text-sm text-muted-foreground">No payments yet.</div>
        )}
        {payments.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between text-sm border-b border-border pb-2 last:border-0"
          >
            <div>
              <div className="font-medium">{p.bkashTrxId}</div>
              <div className="text-xs text-muted-foreground">
                {new Date(p.createdAt).toLocaleString()}
              </div>
            </div>
            <div className="text-right">
              <div className="font-medium">৳{p.totalAmount}</div>
              <div className="text-xs text-muted-foreground">{p.paymentStatus}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}