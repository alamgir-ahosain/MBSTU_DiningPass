import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { hallStaffAPI } from "@/services/api";
import { PageHeader } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import type { SummaryRow } from "@/types";
import { AppShell } from "@/components/AppShell";


export function HallMealSummary() {
    const { user, userData } = useAuth();
    const [rows, setRows] = useState<SummaryRow[]>([]);

    useEffect(() => {
        if (!user) return;
        (async () => {
            try {
                const res = await hallStaffAPI.getHallSummaries();
                setRows([...(res.data ?? [])].sort((a: SummaryRow, b: SummaryRow) => (a.mealDate < b.mealDate ? 1 : -1)));
            } catch (e) {
                console.error(e);
                toast.error("Failed to load meal summary");
            }
        })();
    }, [user]);

    if (!user) return null;

    const totals = rows.reduce(
        (acc, r) => ({
            sold: acc.sold + r.sold,
            used: acc.used + r.used,
            unused: acc.unused + r.unused,
            revenue: acc.revenue + r.revenue,
        }),
        { sold: 0, used: 0, unused: 0, revenue: 0 },
    );

    return (
       <AppShell>
           <div>
               <PageHeader
                   title="Meal Summary" subtitle={userData?.hallShortName
                   ? `Token & revenue stats for ${userData.hallShortName}.`
                   : "Token & revenue statistics."
               }
               />

               <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                   <StatBox label="Tokens Sold" value={totals.sold} />
                   <StatBox label="Tokens Used" value={totals.used} tone="success" />
                   <StatBox label="Tokens Unused" value={totals.unused} tone="warning" />
                   <StatBox label="Total Revenue" value={`৳${totals.revenue}`} tone="primary" />
               </div>

               <div className="rounded-xl border border-border bg-card overflow-hidden">
                   <Table>
                       <TableHeader>
                           <TableRow>
                               <TableHead>Date</TableHead>
                               <TableHead>Type</TableHead>
                               <TableHead>Menu</TableHead>
                               <TableHead className="text-right">Sold</TableHead>
                               <TableHead className="text-right">Used</TableHead>
                               <TableHead className="text-right">Unused</TableHead>
                               <TableHead className="text-right">Revenue</TableHead>
                               <TableHead>Status</TableHead>
                           </TableRow>
                       </TableHeader>
                       <TableBody>
                           {rows.map((r, i) => {
                               const usagePct = r.sold > 0 ? Math.round((r.used / r.sold) * 100) : 0;
                               return (
                                   <TableRow key={i}>
                                       <TableCell>{r.mealDate}</TableCell>
                                       <TableCell><Badge variant={r.mealType === "LUNCH" ? "default" : "secondary"}>{r.mealType}</Badge></TableCell>
                                       <TableCell>
                                           <div className="font-medium">{r.mealMenu}</div>
                                           {r.feastNote && <div className="text-xs text-muted-foreground italic">{r.feastNote}</div>}
                                       </TableCell>
                                       <TableCell className="text-right">{r.sold}</TableCell>
                                       <TableCell className="text-right">
                                           <div className="font-medium">{r.used}</div>
                                           {r.sold > 0 && <div className="text-xs text-muted-foreground">{usagePct}%</div>}
                                       </TableCell>
                                       <TableCell className="text-right">{r.unused}</TableCell>
                                       <TableCell className="text-right font-medium">৳{r.revenue}</TableCell>
                                       <TableCell><Badge variant={r.isFinalized ? "outline" : "default"}>{r.isFinalized ? "Finalized" : "Open"}</Badge></TableCell>
                                   </TableRow>
                               );
                           })}
                           {rows.length === 0 && (
                               <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">No summary data yet.</TableCell></TableRow>
                           )}
                       </TableBody>
                   </Table>
               </div>
           </div>
       </AppShell>
    );
}

function StatBox({ label, value, tone = "default" }: { label: string; value: string | number; tone?: "default" | "success" | "warning" | "primary" }) {
    const toneClass = tone === "success" ? "text-success" : tone === "warning" ? "text-warning" : tone === "primary" ? "text-primary" : "text-foreground";
    return (
        <div className="rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
            <div className={`mt-2 font-display text-2xl ${toneClass}`}>{value}</div>
        </div>
    );
}