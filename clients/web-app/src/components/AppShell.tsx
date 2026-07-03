import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, type ReactNode } from "react";
import {
  Building2, CalendarDays, CreditCard, GraduationCap,
  LayoutDashboard, LogOut, Menu, QrCode, Receipt,
  Settings, ShieldCheck, Ticket, User, Users, UserCog, UtensilsCrossed,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/lib/theme";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger,
} from "@/components/ui/sheet";

interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
}

const studentNav: NavItem[] = [
  { to: "/dashboard",             label: "Dashboard",    icon: LayoutDashboard },
  { to: "/student/cut-token",     label: "Cut Token",    icon: Ticket },
  { to: "/student/my-tokens",     label: "My Tokens",    icon: QrCode },
  { to: "/student/payment-history", label: "Payments",   icon: Receipt },
  { to: "/student/profile",       label: "Profile",      icon: User },
  { to: "/student/change-password", label: "Password",   icon: Settings },
];

const staffNav: NavItem[] = [
  { to: "/dashboard",               label: "Dashboard",     icon: LayoutDashboard },
  { to: "/hallStaff/validate-token", label: "Scan Token",   icon: QrCode },
  { to: "/hallStaff/meals",         label: "Meal Configs",  icon: UtensilsCrossed },
  { to: "/hallStaff/payments",      label: "Payment Queue", icon: CreditCard },
  { to: "/hallStaff/summary",       label: "Meal Summary",  icon: CalendarDays },
  { to: "/hallStaff/profile",       label: "Profile",       icon: User },
  { to: "/hallStaff/change-password", label: "Password",    icon: Settings },
];

const adminNav: NavItem[] = [
  { to: "/dashboard",                 label: "Dashboard",     icon: LayoutDashboard },
  { to: "/hallAdmin/meals",           label: "Meal Configs",  icon: UtensilsCrossed },
  { to: "/hallAdmin/payments",        label: "Payment Queue", icon: CreditCard },
  { to: "/hallAdmin/staff",           label: "Staff",         icon: ShieldCheck },
  { to: "/hallAdmin/students",        label: "Students",      icon: Users },
  { to: "/hallAdmin/profile",         label: "Profile",       icon: User },
  { to: "/hallAdmin/change-password", label: "Password",      icon: Settings },
];

const superAdminNav: NavItem[] = [
  { to: "/dashboard",                   label: "Dashboard",  icon: LayoutDashboard },
  { to: "/superAdmin/halls",            label: "Halls",      icon: Building2 },
  { to: "/superAdmin/admins",           label: "Hall Admins", icon: UserCog },
  { to: "/superAdmin/students",         label: "Students",   icon: Users },
  { to: "/superAdmin/profile",          label: "Profile",    icon: User },
  { to: "/superAdmin/change-password",  label: "Password",   icon: Settings },
];

function NavList({
  items,
  pathname,
  onNavigate,
}: {
  items: NavItem[];
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex-1 p-3 space-y-1">
      {items.map((item) => {
        const active = pathname === item.to;
        const Icon = item.icon;
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors border-l-2 ${
              active
                ? "bg-primary/10 text-primary font-medium border-primary"
                : "text-sidebar-foreground border-transparent hover:bg-sidebar-accent"
            }`}
          >
            <Icon className="size-4" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { userData, role, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Only block render if role is completely unavailable
  if (!role) return null;

  const nav =
    role === "STUDENT"     ? studentNav :
    role === "HALL_STAFF"  ? staffNav   :
    role === "SUPER_ADMIN" ? superAdminNav : adminNav;

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const roleLabel =
    role === "STUDENT"     ? "Student"    :
    role === "HALL_STAFF"  ? "Hall Staff" :
    role === "SUPER_ADMIN" ? "Super Admin": "Hall Admin";

  const displayName = (userData as Record<string, unknown>)?.fullName as string
    ?? (userData as Record<string, unknown>)?.name as string
    ?? "User";

  const hallShortName = (userData as Record<string, unknown>)?.hallShortName as string ?? "";

  const SidebarBrand = (
    <div className="px-6 py-6 border-b border-sidebar-border">
      <div className="flex items-center gap-3">
        <div className="size-10 rounded-full bg-primary text-primary-foreground grid place-items-center">
          <GraduationCap className="size-5" />
        </div>
        <div>
          <div className="text-lg font-bold leading-tight text-sidebar-foreground">MBSTU</div>
          <div className="text-xs opacity-80 text-sidebar-foreground">DiningPass</div>
        </div>
      </div>
    </div>
  );

  const SidebarFooter = (
    <div className="p-3 border-t border-sidebar-border">
      <div className="px-2 pb-2 text-xs">
        <div className="font-medium text-sidebar-foreground">{displayName}</div>
        <div className="opacity-70 text-sidebar-foreground">
          {roleLabel}{hallShortName ? ` · ${hallShortName}` : ""}
        </div>
      </div>
      <Button
        variant="ghost"
        className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
        onClick={handleLogout}
      >
        <LogOut className="size-4 mr-2" />
        Sign out
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 flex-col bg-sidebar fixed top-0 left-0 h-full z-20">
        {SidebarBrand}
        <NavList items={nav} pathname={pathname} />
        {SidebarFooter}
      </aside>

      {/* Spacer for fixed sidebar on desktop */}
      <div className="hidden md:block w-64 shrink-0" />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-sidebar text-sidebar-foreground sticky top-0 z-20">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
                aria-label="Open menu"
              >
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72 bg-sidebar border-sidebar-border">
              <SheetHeader className="sr-only">
                <SheetTitle>Navigation</SheetTitle>
              </SheetHeader>
              <div className="flex h-full flex-col">
                {SidebarBrand}
                <NavList
                  items={nav}
                  pathname={pathname}
                  onNavigate={() => setMobileOpen(false)}
                />
                {SidebarFooter}
              </div>
            </SheetContent>
          </Sheet>
          <div className="flex items-center gap-2">
            <GraduationCap className="size-5" />
            <span className="font-bold">MBSTU DiningPass</span>
          </div>
          <ThemeToggle className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground" />
        </header>

        {/* Desktop theme toggle */}
        <div className="hidden md:flex justify-end px-10 pt-4">
          <ThemeToggle />
        </div>

        <main className="flex-1 px-4 md:px-10 py-6 md:py-10 max-w-6xl w-full">
          {children}
        </main>
      </div>
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
      <div>
        <h1 className="text-3xl font-bold">{title}</h1>
        {subtitle && <p className="text-muted-foreground mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  );
}
