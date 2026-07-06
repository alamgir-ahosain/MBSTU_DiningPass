import { useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import { Ticket, Download, Clock, UtensilsCrossed, Calendar, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { AppShell } from "@/components/AppShell";
import { mealTokenAPI } from "@/services/api";
import { PageHeader } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { MealToken } from "@/types";

export function StudentMealTokens() {
    const { user } = useAuth();
    const [preview, setPreview] = useState<MealToken | null>(null);

    const {
        data: tokens = [],
        isLoading,
        isError,
    } = useQuery({
        queryKey: ["myMealTokens", user?.uid],
        queryFn: async () => {
            const res = await mealTokenAPI.getMyTokens();
            return [...(res.data ?? [])].sort((a: MealToken, b: MealToken) =>
                a.mealDate < b.mealDate ? 1 : -1
            );
        },
        enabled: !!user,
        staleTime: 60 * 1000, // tokens don't change every second; 1 min is safe
    });

    if (isError) {
        toast.error("Failed to load tokens");
    }

    return (
        <AppShell>
            <div>
                <PageHeader
                    title="My Meal Tokens"
                    subtitle="Tap the QR to enlarge or download for the counter."
                    actions={<Button asChild><Link to="/student/cut-token">Cut new token</Link></Button>}
                />

                {isLoading && (
                    <div className="rounded-xl border border-border bg-card p-10 text-center text-muted-foreground">
                        Loading tokens...
                    </div>
                )}

                {!isLoading && tokens.length === 0 ? (
                    <div className="rounded-xl border border-border bg-card p-10 text-center">
                        <Ticket className="size-10 text-muted-foreground mx-auto mb-3" />
                        <div className="font-display text-lg">No tokens yet</div>
                        <p className="text-muted-foreground text-sm">Cut your first meal token to get started.</p>
                        <Button asChild className="mt-4"><Link to="/student/cut-token">Cut a token</Link></Button>
                    </div>
                ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {tokens.map((t) => (
                            <TokenCard key={t.id} t={t} onPreview={() => setPreview(t)} />
                        ))}
                    </div>
                )}

                <Dialog open={!!preview} onOpenChange={(o) => !o && setPreview(null)}>
                    <DialogContent className="max-w-md">
                        {preview && (
                            <div className="flex flex-col items-center text-center">
                                <div className="bg-white p-4 rounded-lg">
                                    <QRCodeSVG value={preview.qrCodeData} size={300} level="M" />
                                </div>
                                <Badge className="mt-4 bg-amber-100 text-amber-900 hover:bg-amber-100">
                                    {preview.mealType === "LUNCH" ? "☀" : "🌙"} {preview.mealType}
                                </Badge>
                                <div className="mt-3 font-medium text-base">{preview.mealMenu}</div>
                                <div className="text-sm text-muted-foreground mt-1">
                                    {new Date(preview.mealDate).toLocaleDateString()} · valid until{" "}
                                    <span className="text-destructive font-medium">{preview.tokenExpiry ?? ""}</span>
                                </div>
                                <Button className="mt-5" onClick={() => setPreview(null)}>
                                    <X className="size-4" /> Close
                                </Button>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </AppShell>
    );
}

// ? TokenCard is just a card ? no AppShell here
function TokenCard({ t, onPreview }: { t: MealToken; onPreview: () => void }) {
    const qrRef = useRef<SVGSVGElement>(null);

    const downloadQR = () => {
        const svg = qrRef.current;
        if (!svg) return;
        const xml = new XMLSerializer().serializeToString(svg);
        const svgBlob = new Blob([xml], { type: "image/svg+xml;charset=utf-8" });
        const url = URL.createObjectURL(svgBlob);
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement("canvas");
            const size = 600;
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext("2d")!;
            ctx.fillStyle = "#fff";
            ctx.fillRect(0, 0, size, size);
            ctx.drawImage(img, 0, 0, size, size);
            URL.revokeObjectURL(url);
            const link = document.createElement("a");
            link.download = `token-${t.mealType}-${t.mealDate}.png`;
            link.href = canvas.toDataURL("image/png");
            link.click();
        };
        img.src = url;
    };

    const used = t.tokenStatus === "USED";
    const statusLabel = used ? "USED" : t.tokenStatus === "APPROVED" ? "UNUSED" : t.tokenStatus;

    return (
        <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-card flex flex-col">
            <div className="px-5 py-3 flex items-center justify-between border-b border-border">
                <Badge className={t.mealType === "LUNCH"
                    ? "bg-amber-100 text-amber-900 hover:bg-amber-100 text-sm px-3 py-1"
                    : "bg-indigo-100 text-indigo-900 hover:bg-indigo-100 text-sm px-3 py-1"
                }>
                    {t.mealType === "LUNCH" ? "☀" : "🌙"} {t.mealType}
                </Badge>
                <Badge
                    variant={used ? "secondary" : "outline"}
                    className={used ? "" : "border-success text-success"}
                >
                    {statusLabel}
                </Badge>
            </div>

            <button
                onClick={onPreview}
                className="grid place-items-center bg-muted/30 py-5 hover:bg-muted/50 transition-colors cursor-pointer"
                aria-label="Preview QR code"
            >
                <div className="bg-white p-3 rounded-md">
                    <QRCodeSVG ref={qrRef} value={t.qrCodeData} size={150} level="M" />
                </div>
            </button>

            <div className="p-5 space-y-2 flex-1">
                <div className="flex items-start gap-2 text-sm">
                    <UtensilsCrossed className="size-4 text-muted-foreground mt-0.5 shrink-0" />
                    <span className="font-medium">{t.mealMenu}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                    <Calendar className="size-4 text-muted-foreground" />
                    <span>{new Date(t.mealDate).toDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                    <Clock className="size-4 text-destructive" />
                    <span className="text-muted-foreground">Expires:</span>
                    <span className="font-semibold text-destructive">{t.tokenExpiry }</span>
                </div>
            </div>

            <div className="px-5 pb-5">
                <Button variant="outline" className="w-full" onClick={downloadQR} disabled={used}>
                    <Download className="size-4" /> Download Token
                </Button>
            </div>
        </div>
    );
}