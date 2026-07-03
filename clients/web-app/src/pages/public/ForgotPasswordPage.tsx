import { useState } from "react";
import { Link } from "react-router-dom";
import apiClient from "@/services/apiClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthShell } from "./LoginPage";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            await apiClient.post("/auth/forgot-password", { email });
            setSent(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthShell
            title="Reset your password"
            subtitle="We'll send a reset link to your university email."
        >
            {sent ? (
                <div className="space-y-4">
                    <div className="rounded-md bg-green-500/10 border border-green-500/30 text-green-700 px-3 py-3 text-sm">
                        If <span className="font-medium">{email}</span> belongs to an MBSTU DiningPass
                        account, a reset link has been sent.
                    </div>
                    <Button asChild className="w-full">
                        <Link to="/login">Back to sign in</Link>
                    </Button>
                </div>
            ) : (
                <form onSubmit={onSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="email">University Email</Label>
                        <Input
                            id="email"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    {error && (
                        <div className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md px-3 py-2">
                            {error}
                        </div>
                    )}
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "Sending…" : "Send reset link"}
                    </Button>
                    <div className="text-sm text-center text-muted-foreground">
                        <Link to="/login" className="text-primary hover:underline">Back to sign in</Link>
                    </div>
                </form>
            )}
        </AuthShell>
    );
}