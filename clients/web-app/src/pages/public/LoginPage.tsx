import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GraduationCap } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BhashaniQuote } from "@/components/BhashaniQuote";
import { HallGallery } from "@/components/HallGallery";

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid md:grid-cols-2">
      <div className="hidden md:flex flex-col justify-between bg-sidebar text-sidebar-foreground p-10">
        <Link to="/" className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-primary text-primary-foreground grid place-items-center">
            <GraduationCap className="size-5" />
          </div>
          <div className="leading-tight">
            <div className="text-lg font-bold">MBSTU DiningPass</div>
            <div className="text-xs opacity-80">Residential Hall Meal System</div>
          </div>
        </Link>
        <HallGallery />
        <BhashaniQuote />
        <div className="text-xs opacity-70">
          Mawlana Bhashani Science and Technology University · Santosh, Tangail
        </div>
      </div>

      <div className="flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md">
          <div className="md:hidden mb-6 flex items-center gap-3">
            <div className="size-10 rounded-full bg-primary text-primary-foreground grid place-items-center">
              <GraduationCap className="size-5" />
            </div>
            <div className="font-bold text-lg">MBSTU DiningPass</div>
          </div>
          <h1 className="text-3xl font-bold">{title}</h1>
          {subtitle && <p className="text-muted-foreground mt-1">{subtitle}</p>}
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const { login, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user) navigate("/dashboard");
  }, [authLoading, user, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login({ email, password });
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Welcome back" subtitle="Sign in with your MBSTU DiningPass account.">
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">University Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="rakib@mbstu.ac.bd"
          />
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link to="/forgot-password" className="text-xs text-primary hover:underline">
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && (
          <div className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md px-3 py-2">
            {error}
          </div>
        )}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>
      <div className="mt-6 text-sm text-center text-muted-foreground">
        New student?{" "}
        <Link to="/register" className="text-primary hover:underline font-medium">
          Create an account
        </Link>
      </div>
    </AuthShell>
  );
}