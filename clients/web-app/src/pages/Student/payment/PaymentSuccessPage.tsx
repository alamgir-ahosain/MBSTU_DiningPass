import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, Ticket, Receipt, Home } from "lucide-react";
import { paymentAPI } from "@/services/api";
import { PageHeader } from "@/components/AppShell";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import type { Payment } from "@/types";

export function PaymentSuccessPage() {
    const [searchParams] = useSearchParams();
    const paymentId = searchParams.get("paymentID");
    const [payment, setPayment] = useState<Payment | null>(null);

    useEffect(() => {
        if (!paymentId) return;
        (async () => {
            try {
                const res = await paymentAPI.getPaymentById(paymentId);
                setPayment(res.data);
            } catch (e) {
                console.error(e);
            }
        })();
    }, [paymentId]);

    return (
     <AppShell>
         <div>
             <PageHeader title="Payment successful" subtitle="Your meal tokens are ready." />
             <div className="max-w-lg mx-auto rounded-2xl border border-border bg-card p-8 shadow-academic text-center">
                 <div className="mx-auto size-20 rounded-full bg-green-100 dark:bg-green-900/30 grid place-items-center mb-4">
                     <CheckCircle2 className="size-12 text-green-600 dark:text-green-400" />
                 </div>
                 <h2 className="font-display text-2xl">Thank you!</h2>
                 <p className="text-muted-foreground mt-1">Your bKash payment has been received.</p>

                 {payment && (
                     <div className="mt-6 text-left rounded-xl border border-border bg-muted/30 p-4 space-y-2 text-sm">
                         <Row label="Invoice" value={payment.merchantInvoiceNo} />
                         <Row label="Transaction ID" value={payment.bkashTrxId} />
                         <Row label="Meal Date" value={new Date(payment.mealDate).toDateString()} />
                         <Row label="Meals" value={payment.mealTypes.join(" + ")} />
                         <div className="flex justify-between pt-2 border-t border-border">
                             <span className="text-muted-foreground">Amount paid</span>
                             <span className="font-display text-xl text-primary">৳{payment.totalAmount}</span>
                         </div>
                     </div>
                 )}

                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-6">
                     <Button asChild className="gap-2"><Link to="/student/my-tokens"><Ticket className="size-4" /> View My Tokens</Link></Button>
                     <Button asChild variant="outline" className="gap-2"><Link to="/student/payment-history"><Receipt className="size-4" /> Payment History</Link></Button>
                 </div>
                 <Button asChild variant="ghost" className="mt-2 gap-2"><Link to="/dashboard"><Home className="size-4" /> Back to Dashboard</Link></Button>
             </div>
         </div>
     </AppShell>
    );
}

function Row({ label, value }: { label: string; value: string }) {
    return (
        <AppShell>
            <div className="flex justify-between">
                <span className="text-muted-foreground">{label}</span>
                <span className="font-medium">{value}</span>
            </div>
        </AppShell>
    );
}