import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/AppShell";
import { AppShell } from "@/components/AppShell";

import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import type { Payment, PaymentStatus } from "@/types";

interface PaymentsApi {
  getPayments: (f?: object) => Promise<{ data: Payment[] }>;
  approvePayment: (id: string) => Promise<unknown>;
  rejectPayment: (id: string, reason: string) => Promise<unknown>;
}

export function PaymentsQueuePage({ api, title, subtitle }: { api: PaymentsApi; title: string; subtitle: string }) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filter, setFilter] = useState<"ALL" | PaymentStatus>("ALL");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.getPayments(filter === "ALL" ? {} : { status: filter });
      setPayments(
        [...res.data].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)),
      );
    } catch (e) {
      console.error(e);
      toast.error("Failed to load payments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const refund = async (id: string) => {
    try {
      await api.rejectPayment(id, "Refunded");
      toast.success("Payment refunded via bKash");
      load();
    } catch (e) {
      console.error(e);
      toast.error("Failed to refund payment");
    }
  };

  return (
    <AppShell>
      <div>
        <PageHeader
            title={title}
            subtitle={subtitle}
            actions={
              <div className="flex gap-1">
                {(["ALL", "COMPLETED", "REFUNDED", "FAILED"] as const).map((f) => (
                    <Button key={f} size="sm" variant={filter === f ? "default" : "outline"} onClick={() => setFilter(f)}>
                      {f}
                    </Button>
                ))}
              </div>
            }
        />

        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Submitted</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Meal Date</TableHead>
                <TableHead>Types</TableHead>
                <TableHead>bKash Trx</TableHead>
                <TableHead>MSISDN</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="text-sm">{new Date(p.createdAt).toLocaleString()}</TableCell>
                    <TableCell className="text-sm">{p.studentName ?? p.studentId}</TableCell>
                    <TableCell>{p.mealDate}</TableCell>
                    <TableCell>{p.mealTypes.join(", ")}</TableCell>
                    <TableCell className="font-mono text-xs">{p.bkashTrxId}</TableCell>
                    <TableCell className="text-sm">{p.customerMsisdn}</TableCell>
                    <TableCell className="text-right font-medium">৳{p.totalAmount}</TableCell>
                    <TableCell>
                      <Badge
                          variant={
                            p.paymentStatus === "COMPLETED" ? "default" :
                                p.paymentStatus === "FAILED" ? "destructive" : "outline"
                          }
                      >
                        {p.paymentStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {p.paymentStatus === "COMPLETED" && (
                          <Button size="sm" variant="outline" onClick={() => refund(p.id)}>Refund</Button>
                      )}
                    </TableCell>
                  </TableRow>
              ))}
              {!loading && payments.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                      No payments found.
                    </TableCell>
                  </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AppShell>
  );
}