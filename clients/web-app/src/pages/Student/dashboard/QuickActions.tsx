import { Link } from "react-router-dom";
import { CreditCard, QrCode, Ticket, User as UserIcon } from "lucide-react";

const actions = [
  { to: "/student/cut-token", label: "Cut Token", desc: "Book a meal", icon: Ticket },
  { to: "/student/my-tokens", label: "My Tokens", desc: "View QR codes", icon: QrCode },
  { to: "/student/payment-history", label: "Payments", desc: "Transaction history", icon: CreditCard },
  { to: "/student/profile", label: "Profile", desc: "Personal details", icon: UserIcon },
] as const;

export function StudentQuickActions() {
  return (
    <>
      <h2 className="font-display text-2xl mb-4">Quick actions</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((a) => {
          const Icon = a.icon;
          return (
            <Link
              key={a.to}
              to={a.to}
              className="rounded-xl border border-border bg-card p-5 hover:shadow-academic transition-shadow group"
            >
              <div className="size-10 rounded-md bg-primary/10 text-primary grid place-items-center mb-3 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <Icon className="size-5" />
              </div>
              <div className="font-display text-lg">{a.label}</div>
              <div className="text-xs text-muted-foreground">{a.desc}</div>
            </Link>
          );
        })}
      </div>
    </>
  );
}