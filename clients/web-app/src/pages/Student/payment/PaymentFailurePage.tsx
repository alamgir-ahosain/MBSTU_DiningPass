import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { XCircle, RotateCcw, Home } from "lucide-react";
import { PageHeader } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { AppShell } from "@/components/AppShell";

const REASONS: Record<string, string> = {
    insufficient: "Insufficient balance in your bKash account.",
    cancelled: "Payment was cancelled before completion.",
    timeout: "Payment session timed out. Please try again.",
    network: "Network issue while contacting bKash. No amount was charged.",
};

export function PaymentFailurePage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const amount = searchParams.get("amount");
    const reason = searchParams.get("reason");
    const trxId = searchParams.get("trxId");
    const message = (reason && REASONS[reason]) || "The payment could not be completed.";


    return (
        <AppShell>
            <div>
                <PageHeader title="Payment failed" subtitle="No tokens were generated." />
                <div className="max-w-lg mx-auto rounded-2xl border border-border bg-card p-8 shadow-academic text-center">
                    <div className="mx-auto size-20 rounded-full bg-red-100 dark:bg-red-900/30 grid place-items-center mb-4">
                        <XCircle className="size-12 text-red-600 dark:text-red-400" />
                    </div>
                    <h2 className="font-display text-2xl">Payment unsuccessful</h2>
                    <p className="text-muted-foreground mt-1">{message}</p>

                    <div className="mt-6 text-left rounded-xl border border-border bg-muted/30 p-4 space-y-2 text-sm">
                        {amount && (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Attempted amount</span>
                                <span className="font-medium">৳{amount}</span>
                            </div>
                        )}
                        {trxId && (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Reference</span>
                                <span className="font-medium">{trxId}</span>
                            </div>
                        )}
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Status</span>
                            <span className="font-medium text-red-600 dark:text-red-400">FAILED</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-6">
                        <Button onClick={() => navigate("/student/cut-token")} className="gap-2"><RotateCcw className="size-4" /> Try Again</Button>
                        <Button asChild variant="outline" className="gap-2"><Link to="/dashboard"><Home className="size-4" /> Back to Dashboard</Link></Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-4">
                        If any amount was debited, it will be refunded automatically within 3–5 business days.
                    </p>
                </div>
            </div>
        </AppShell>
    );
}