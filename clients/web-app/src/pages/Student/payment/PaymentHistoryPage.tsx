// import { useEffect, useState } from "react";
// import { toast } from "sonner";
// import { useAuth } from "@/context/AuthContext";
// import { paymentAPI } from "@/services/api";
// import { AppShell } from "@/components/AppShell";
// import { PageHeader } from "@/components/AppShell";
// import { Badge } from "@/components/ui/badge";
// import {
//     Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
// } from "@/components/ui/table";
// import type { Payment, PaymentStatus } from "@/types";
//
// export function PaymentHistoryPage() {
//     const { user } = useAuth();
//     const [payments, setPayments] = useState<Payment[]>([]);
//
//     useEffect(() => {
//         if (!user) return;
//         (async () => {
//             try {
//                 const res = await paymentAPI.getMyPayments();
//                 setPayments([...(res.data ?? [])].sort((a: Payment, b: Payment) => (a.createdAt < b.createdAt ? 1 : -1)));
//             } catch (e) {
//                 console.error(e);
//                 toast.error("Failed to load payment history");
//             }
//         })();
//     }, [user]);
//
//     const statusVariant = (s: PaymentStatus): "default" | "secondary" | "destructive" | "outline" => {
//         if (s === "COMPLETED") return "default";
//         if (s === "FAILED") return "destructive";
//         if (s === "REFUNDED") return "outline";
//         return "secondary";
//     };
//
//
//     return (
//         <AppShell>
//             <div>
//                 <PageHeader title="Payment History" subtitle="All your bKash transactions." />
//                 <div className="rounded-xl border border-border bg-card overflow-hidden">
//                     <Table>
//                         <TableHeader>
//                             <TableRow>
//                                 <TableHead>Date</TableHead>
//                                 <TableHead>Meal</TableHead>
//                                 <TableHead>Types</TableHead>
//                                 <TableHead>bKash Trx</TableHead>
//                                 <TableHead>Invoice</TableHead>
//                                 <TableHead className="text-right">Amount</TableHead>
//                                 <TableHead>Status</TableHead>
//                             </TableRow>
//                         </TableHeader>
//                         <TableBody>
//                             {payments.length === 0 && (
//                                 <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No payments yet.</TableCell></TableRow>
//                             )}
//                             {payments.map((p) => (
//                                 <TableRow key={p.id}>
//                                     <TableCell className="text-sm">{new Date(p.createdAt).toLocaleString()}</TableCell>
//                                     <TableCell>{new Date(p.mealDate).toDateString()}</TableCell>
//                                     <TableCell>{p.mealTypes.join(", ")}</TableCell>
//                                     <TableCell className="font-mono text-xs">{p.bkashTrxId}</TableCell>
//                                     <TableCell className="font-mono text-xs">{p.merchantInvoiceNo}</TableCell>
//                                     <TableCell className="text-right font-medium">৳{p.totalAmount}</TableCell>
//                                     <TableCell><Badge variant={statusVariant(p.paymentStatus)}>{p.paymentStatus}</Badge></TableCell>
//                                 </TableRow>
//                             ))}
//                         </TableBody>
//                     </Table>
//                 </div>
//             </div>
//         </AppShell>
//     );
// }