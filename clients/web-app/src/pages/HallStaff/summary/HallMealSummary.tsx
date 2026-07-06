import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { hallStaffAPI } from "@/services/api";
import { PageHeader } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import type { SummaryRow } from "@/types";
import { AppShell } from "@/components/AppShell";

interface PageResponse<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    number: number; // current page (0-indexed)
    size: number;
}

export function HallMealSummary() {
    const { user, userData } = useAuth();
    const [rows, setRows] = useState<SummaryRow[]>([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(false);
    const pageSize = 10;

    useEffect(() => {
        if (!user) return;
        (async () => {
            setLoading(true);
            try {
                const res = await hallStaffAPI.getHallSummaries(page, pageSize);
                const data: PageResponse<SummaryRow> = res.data;
                const content = [...(data?.content ?? [])].sort((a, b) =>
                    a.mealDate < b.mealDate ? 1 : -1
                );
                setRows(content);
                setTotalPages(data?.totalPages ?? 0);
            } catch (e) {
                console.error(e);
                toast.error("Failed to load meal summary");
            } finally {
                setLoading(false);
            }
        })();
    }, [user, page]);

    if (!user) return null;

    const totals = rows.reduce(
        (acc, r) => ({
            sold: acc.sold + r.totalTokensSold,
            used: acc.used + r.totalTokensUsed,
            unused: acc.unused + r.totalTokensUnused,
            revenue: acc.revenue + r.totalRevenue,
        }),
        { sold: 0, used: 0, unused: 0, revenue: 0 },
    );

    return (
        <AppShell>
            <div>
                <PageHeader
                    title="Meal Summary"
                    subtitle={
                        userData?.hallShortName
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
                                <TableHead>isFinalized</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rows.map((r, i) => {
                               
                                return (
                                    <TableRow key={`${r.hallShortName}-${r.mealType}-${r.mealDate}-${i}`}>
                                        <TableCell>{r.mealDate}</TableCell>
                                        <TableCell>
                                            <Badge variant={r.mealType === "LUNCH" ? "default" : "secondary"}>
                                                {r.mealType}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium">{r.mealMenu}</div>
                                            {r.feastNote && (
                                                <div className="text-xs text-muted-foreground italic">
                                                    {r.feastNote}
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">{r.totalTokensSold}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="font-medium">{r.totalTokensUsed}</div>
                                        </TableCell>
                                        <TableCell className="text-right">{r.totalTokensUnused}</TableCell>
                                        <TableCell className="text-right font-medium">৳{r.totalRevenue}</TableCell>
                                        <TableCell>
                                            <Badge variant={r.isFinalized ? "outline" : "default"}>
                                                {r.isFinalized ? "Yes" : "No"}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                            {!loading && rows.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                                        No summary data yet.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {totalPages > 1 && (
                    <div className="flex items-center justify-end gap-2 mt-4">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={page === 0 || loading}
                            onClick={() => setPage((p) => Math.max(0, p - 1))}
                        >
                            Previous
                        </Button>
                        <span className="text-sm text-muted-foreground">
                            Page {page + 1} of {totalPages}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={page + 1 >= totalPages || loading}
                            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                        >
                            Next
                        </Button>
                    </div>
                )}
            </div>
        </AppShell>
    );
}

function StatBox({
                     label,
                     value,
                     tone = "default",
                 }: {
    label: string;
    value: string | number;
    tone?: "default" | "success" | "warning" | "primary";
}) {
    const toneClass =
        tone === "success"
            ? "text-success"
            : tone === "warning"
                ? "text-warning"
                : tone === "primary"
                    ? "text-primary"
                    : "text-foreground";
    return (
        <div className="rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
            <div className={`mt-2 font-display text-2xl ${toneClass}`}>{value}</div>
        </div>
    );
}