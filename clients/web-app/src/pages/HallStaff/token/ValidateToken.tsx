import { useCallback, useRef, useState } from "react";
import { CheckCircle2, QrCode, ScanLine, XCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { hallStaffAPI } from "@/services/api";
import { PageHeader } from "@/components/AppShell";
import { QrScanner } from "@/components/QrScanner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AppShell } from "@/components/AppShell";

// Mirrors backend QrScanResponse: { valid, result, mealType, mealDate, message }
interface QrScanResponseBody {
    valid: boolean;
    result: string;
    mealType: string | null;
    mealDate: string | null;
    message: string;
}

type Result =
    | { kind: "success"; mealType: string; mealDate: string; message: string }
    | { kind: "error"; resultCode: string; message: string };

export function ValidateToken() {
    const { user, userData } = useAuth();
    const [camOn, setCamOn] = useState(false);
    const [manual, setManual] = useState("");
    const [result, setResult] = useState<Result | null>(null);
    const [busy, setBusy] = useState(false);
    const busyRef = useRef(false);

    const validate = useCallback(
        async (qrData: string) => {
            if (!user || busyRef.current) return;
            busyRef.current = true;
            setBusy(true);
            try {
                const res = await hallStaffAPI.scanQrToken(qrData.trim());
                const data = res.data as QrScanResponseBody;

                if (data.valid) {
                    setResult({
                        kind: "success",
                        mealType: data.mealType ?? "-",
                        mealDate: data.mealDate ?? "-",
                        message: data.message,
                    });
                    setCamOn(false);
                } else {
                    // Backend returns 200 OK even for invalid/expired/used tokens —
                    // "valid" must be checked explicitly rather than relying on catch().
                    setResult({
                        kind: "error",
                        resultCode: data.result,
                        message: data.message || "Invalid or tampered token.",
                    });
                }
            } catch (e: unknown) {
                const message =
                    (e as { response?: { data?: { message?: string } } })?.response?.data?.message ??
                    "Invalid or tampered token.";
                setResult({ kind: "error", resultCode: "REQUEST_FAILED", message });
            } finally {
                busyRef.current = false;
                setBusy(false);
            }
        },
        [user],
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
                        <div className="text-sm text-muted-foreground mt-1">{result.message}</div>
                        <div className="mt-5 grid grid-cols-2 gap-3 text-left text-sm bg-card rounded-xl p-4 border border-border">
                            <Field label="Hall" value={userData?.hallShortName ?? ""} />
                            <Field label="Date" value={new Date(result.mealDate).toDateString()} />
                            <Field label="Meal" value={result.mealType} />
                        </div>
                        <Button className="mt-5" onClick={reset}>Scan next</Button>
                    </div>
                )}

                {result?.kind === "error" && (
                    <div className="rounded-2xl border-2 border-destructive bg-destructive/10 p-6 max-w-xl mx-auto text-center">
                        <XCircle className="size-14 text-destructive mx-auto mb-3" />
                        <div className="font-display text-2xl">Cannot redeem</div>
                        <div className="text-xs uppercase tracking-wider text-muted-foreground mt-2">{result.resultCode}</div>
                        <div className="text-sm mt-1">{result.message}</div>
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