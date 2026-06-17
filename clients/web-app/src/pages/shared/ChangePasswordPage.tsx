import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { PageHeader } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AppShell } from "@/components/AppShell";

export function ChangePasswordPage({
  changePassword,
}: {
  changePassword: (oldPassword: string, newPassword: string) => Promise<unknown>;
}) {
  const { user } = useAuth();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!user) return null;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (next.length < 6) return setErr("New password must be at least 6 characters.");
    if (next !== confirm) return setErr("New password and confirmation do not match.");
    setLoading(true);
    try {
      await changePassword(current, next);
      setCurrent("");
      setNext("");
      setConfirm("");
      toast.success("Password updated successfully");
    } catch (e: any) {
      setErr(e?.response?.data?.message ?? "Failed to update password.");
    } finally {
      setLoading(false);
    }
  };
  
  return (
      <AppShell>
        <div>
          <PageHeader title="Change Password" subtitle="Use a strong password you don't use elsewhere." />
          <form onSubmit={onSubmit} className="max-w-md space-y-4 rounded-xl border border-border bg-card p-6">
            <div className="space-y-1.5">
              <Label htmlFor="current">Current password</Label>
              <Input id="current" type="password" required value={current} onChange={(e) => setCurrent(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new">New password</Label>
              <Input id="new" type="password" required minLength={6} value={next} onChange={(e) => setNext(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirm">Confirm new password</Label>
              <Input id="confirm" type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} />
            </div>
            {err && (
                <div className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md px-3 py-2">{err}</div>
            )}
            <Button type="submit" disabled={loading}>{loading ? "Updating…" : "Update password"}</Button>
          </form>
        </div>
      </AppShell>

  );
}