import { Link } from "react-router-dom";
import { Building2, User as UserIcon, UserCog, Users } from "lucide-react";

const actions = [
  { to: "/superAdmin/halls", label: "Halls", desc: "Manage halls", icon: Building2 },
  { to: "/superAdmin/admins", label: "Hall Admins", desc: "Provost accounts", icon: UserCog },
  { to: "/superAdmin/students", label: "Students", desc: "All students", icon: Users },
  { to: "/superAdmin/profile", label: "Profile", desc: "Personal details", icon: UserIcon },
] as const;

export function SuperAdminQuickActions() {
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