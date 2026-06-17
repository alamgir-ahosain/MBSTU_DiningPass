import { useCallback, useState } from "react";
import { CheckCircle2, QrCode, ScanLine, XCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { hallStaffAPI } from "@/services/api";
import { PageHeader } from "@/components/AppShell";
import { QrScanner } from "@/components/QrScanner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { MealToken } from "@/types";
import { AppShell } from "@/components/AppShell";

type Result =
    | { kind: "success"; token: MealToken; studentName: string }
    | { kind: "error"; message: string };

export function ValidateToken() {
    const { user, userData } = useAuth();
    const [camOn, setCamOn] = useState(false);
    const [manual, setManual] = useState("");
    const [result, setResult] = useState<Result | null>(null);
    const [busy, setBusy] = useState(false);

    const validate = useCallback(
        async (qrData: string) => {
            if (!user || busy) return;
            setBusy(true);
            try {
                const res = await hallStaffAPI.scanQrToken(qrData.trim());
                const data = res.data;
                setResult({ kind: "success", token: data.token, studentName: data.studentName });
                setCamOn(false);
            } catch (e: any) {
                setResult({ kind: "error", message: e?.response?.data?.message ?? "Invalid or tampered token." });
            } finally {
                setBusy(false);
            }
        },
        [user, busy],
    );

    const reset = () => {
        setResult(null);
        setManual("");
    };

    return (
        <AppShell>
            <div>
                <PageHeader title="Scan Meal Token" subtitle="Scan a student's QR code or paste the token data to verify." />

                {!result && (
                    <div className="rounded-2xl border border-border bg-card p-6 max-w-xl mx-auto">
                        {camOn ? (
                            <QrScanner active onResult={validate} onStop={() => setCamOn(false)} />
                        ) : (
                            <div className="text-center py-8">
                                <ScanLine className="size-12 text-primary mx-auto mb-3" />
                                <div className="font-display text-lg mb-2">Ready to scan</div>
                                <p className="text-sm text-muted-foreground mb-4">Use the device camera or paste the token data below.</p>
                                <Button onClick={() => setCamOn(true)}><QrCode className="size-4" /> Start camera</Button>
                            </div>
                        )}

                        <div className="mt-6 border-t border-border pt-4">
                            <label className="text-sm font-medium">Or paste QR data</label>
                            <div className="flex gap-2 mt-2">
                                <Input placeholder="MBSTU|..." value={manual} onChange={(e) => setManual(e.target.value)} />
                                <Button onClick={() => validate(manual)} disabled={!manual.trim() || busy}>Verify</Button>
                            </div>
                        </div>
                    </div>
                )}

                {result?.kind === "success" && (
                    <div className="rounded-2xl border-2 border-success bg-success/10 p-6 max-w-xl mx-auto text-center">
                        <CheckCircle2 className="size-14 text-success mx-auto mb-3" />
                        <div className="font-display text-2xl">Token verified</div>
                        <div className="text-sm text-muted-foreground mt-1">
                            Marked as USED at {new Date(result.token.usedAt!).toLocaleTimeString()}
                        </div>
                        <div className="mt-5 grid grid-cols-2 gap-3 text-left text-sm bg-card rounded-xl p-4 border border-border">
                            <Field label="Student" value={result.studentName} />
                            <Field label="Hall" value={userData?.hallShortName ?? ""} />
                            <Field label="Date" value={new Date(result.token.mealDate).toDateString()} />
                            <Field label="Meal" value={result.token.mealType} />
                            <Field label="Menu" value={result.token.mealMenu} />
                            <Field label="Price" value={`৳${result.token.mealPrice}`} />
                        </div>
                        <Button className="mt-5" onClick={reset}>Scan next</Button>
                    </div>
                )}

                {result?.kind === "error" && (
                    <div className="rounded-2xl border-2 border-destructive bg-destructive/10 p-6 max-w-xl mx-auto text-center">
                        <XCircle className="size-14 text-destructive mx-auto mb-3" />
                        <div className="font-display text-2xl">Cannot redeem</div>
                        <div className="text-sm mt-2">{result.message}</div>
                        <Button className="mt-5" variant="outline" onClick={reset}>Try again</Button>
                    </div>
                )}
            </div>

        </AppShell>
    );
}

function Field({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
            <div className="font-medium">{value}</div>
        </div>
    );
}