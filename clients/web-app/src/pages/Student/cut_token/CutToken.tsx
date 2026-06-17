import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Check, ChevronRight, Clock, MapPin, Smartphone, TrendingUp, Utensils } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { studentAPI, bkashPaymentAPI } from "@/services/api";
import { AppShell } from "@/components/AppShell";
import { formatTime12, isBookingOpen } from "@/lib/utils";
import { PageHeader } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { MealConfig, MealType } from "@/types";

function groupByDate(configs: MealConfig[]) {
    const map = new Map<string, MealConfig[]>();
    for (const c of configs) {
        const arr = map.get(c.mealDate) || [];
        arr.push(c);
        map.set(c.mealDate, arr);
    }
    return Array.from(map.entries()).sort(([a], [b]) => (a < b ? -1 : 1));
}

export function CutToken() {
    const { user, userData } = useAuth();
    const [configs, setConfigs] = useState<MealConfig[]>([]);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [selectedTypes, setSelectedTypes] = useState<MealType[]>([]);
    const [step, setStep] = useState<"select" | "pay">("select");
    const [paying, setPaying] = useState(false);

    useEffect(() => {
        const hallShortName = userData?.hallShortName;

        if (!hallShortName) return;

        (async () => {
            try {
                const res = await studentAPI.getAvailableMealConfigs(hallShortName);
                setConfigs(res.data ?? []);
            } catch (e) {
                console.error(e);
                toast.error("Failed to load meals");
            }
        })();
    }, [userData?.hallShortName]);

    const grouped = useMemo(() => groupByDate(configs.filter((c) => c.isActive)), [configs]);

    if (!user) return null;

    const dayConfigs = selectedDate ? grouped.find(([d]) => d === selectedDate)?.[1] || [] : [];
    const total = dayConfigs
        .filter((c) => selectedTypes.includes(c.mealType))
        .reduce((acc, c) => acc + c.mealPrice, 0);

    const toggleType = (t: MealType) => {
        setSelectedTypes((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
    };

    const handlePay = async () => {
        if (!selectedDate || selectedTypes.length === 0) return;
        setPaying(true);
        try {
            const res = await bkashPaymentAPI.createPayment({
                mealDate: selectedDate,
                mealTypes: selectedTypes,
                totalAmount: total,
                paymentMethod: "BKASH",   // Now,will be add more payment method in future

            });
            const bkashURL = res.data?.bkashURL;
            if (bkashURL) {
                window.location.href = bkashURL;
            } else {
                toast.error("Could not start bKash payment.");
                setPaying(false);
            }
        } catch (e: any) {
            setPaying(false);
            toast.error(e?.response?.data?.message ?? "Failed to start payment");
        }
    };

    if (step === "pay" && selectedDate) {
        return (
          <AppShell>
              <div>
                  <PageHeader title="Confirm payment" subtitle="Pay securely via bKash." />
                  <div className="max-w-lg rounded-2xl border border-border bg-card p-6 shadow-academic">
                      <div className="text-sm text-muted-foreground">Order summary</div>
                      <div className="font-display text-xl mt-1">{new Date(selectedDate).toDateString()}</div>
                      <div className="mt-4 space-y-2">
                          {dayConfigs
                              .filter((c) => selectedTypes.includes(c.mealType))
                              .map((c) => (
                                  <div key={c.id} className="flex justify-between text-sm border-b border-border pb-2">
                                      <div>
                                          <div className="font-medium">{c.mealType}</div>
                                          <div className="text-muted-foreground text-xs">{c.mealMenu}</div>
                                      </div>
                                      <div className="font-medium">৳{c.mealPrice}</div>
                                  </div>
                              ))}
                      </div>
                      <div className="flex justify-between items-center mt-4 pt-2">
                          <div className="text-sm text-muted-foreground">Total</div>
                          <div className="font-display text-3xl text-primary">৳{total}</div>
                      </div>
                      <Button
                          className="w-full mt-6 bg-[#E2136E] hover:bg-[#c41062] text-white gap-2"
                          onClick={handlePay}
                          disabled={paying}
                          size="lg"
                      >
                          <Smartphone className="size-4" />
                          {paying ? "Redirecting to bKash…" : `Pay ৳${total} with bKash`}
                      </Button>
                      <Button variant="ghost" className="w-full mt-2" onClick={() => setStep("select")}>Back</Button>
                  </div>
              </div>
          </AppShell>
        );
    }

    return (
        <AppShell>
            <div>
                <PageHeader title="Cut Token" subtitle="Book a meal at your hall." />

                {grouped.length === 0 && (
                    <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
                        No meals are currently available.
                    </div>
                )}

                <div className="space-y-6">
                    {grouped.map(([date, dayConfigsList]) => {
                        const dateObj = new Date(date);
                        return (
                            <div key={date} className="rounded-xl border border-border bg-card overflow-hidden">
                                <div className="px-6 py-4 border-b border-border bg-muted/30 flex items-center justify-between">
                                    <div>
                                        <div className="font-display text-lg">
                                            {dateObj.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" })}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {date === new Date().toISOString().slice(0, 10) ? "Today" : ""}
                                        </div>
                                    </div>
                                </div>
                                <div className="grid sm:grid-cols-2 gap-4 p-4">
                                    {dayConfigsList.map((c) => {
                                        const open = isBookingOpen(c);
                                        const isSel = selectedDate === date && selectedTypes.includes(c.mealType);
                                        return (
                                            <button
                                                key={c.id}
                                                type="button"
                                                disabled={!open}
                                                onClick={() => {
                                                    if (!open) return;
                                                    if (selectedDate !== date) {
                                                        setSelectedDate(date);
                                                        setSelectedTypes([c.mealType]);
                                                    } else {
                                                        toggleType(c.mealType);
                                                    }
                                                }}
                                                className={`rounded-xl border-2 p-5 text-left transition-all ${isSel ? "border-primary bg-primary/5 shadow-md" : "border-border hover:border-primary/40 hover:bg-muted/20"
                                                } ${!open ? "opacity-50 cursor-not-allowed" : ""}`}
                                            >
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <Badge variant={c.mealType === "LUNCH" ? "default" : "secondary"}>{c.mealType}</Badge>
                                                        <Badge variant="outline" className="gap-1"><MapPin className="size-3" />{c.hallShortName}</Badge>
                                                        {!open && <Badge variant="outline">Closed</Badge>}
                                                        {c.feastNote && <Badge className="bg-accent text-accent-foreground">Feast</Badge>}
                                                    </div>
                                                    <div className={`size-6 rounded-full border-2 grid place-items-center shrink-0 ${isSel ? "bg-primary border-primary text-primary-foreground" : "border-border"}`}>
                                                        {isSel && <Check className="size-3" />}
                                                    </div>
                                                </div>

                                                <div className="text-sm text-muted-foreground mb-2">
                                                    {new Date(c.mealDate).toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" })}
                                                </div>

                                                <div className="flex items-start gap-2 mb-3">
                                                    <Utensils className="size-4 text-muted-foreground mt-0.5 shrink-0" />
                                                    <span className="font-medium">{c.mealMenu}</span>
                                                </div>

                                                {c.feastNote && (
                                                    <div className="text-sm italic text-accent-foreground bg-accent/40 rounded-md px-3 py-1.5 mb-3">
                                                        🎉 {c.feastNote}
                                                    </div>
                                                )}

                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="font-display text-2xl text-primary">৳{c.mealPrice}</div>
                                                    <div className="flex items-center gap-1 text-sm font-semibold text-destructive">
                                                        <Clock className="size-4" /> Cut by {formatTime12(c.cutTokenBefore)}
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 pt-3 border-t border-border text-sm">
                                                    <TrendingUp className="size-4 text-primary" />
                                                    <span className="font-semibold">{c.tokensSold ?? 0}</span>
                                                    <span className="text-muted-foreground">tokens sold so far</span>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {selectedDate && selectedTypes.length > 0 && (
                    <div className="fixed bottom-0 inset-x-0 md:left-64 bg-card border-t border-border p-4 shadow-academic z-10">
                        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
                            <div>
                                <div className="text-xs text-muted-foreground">
                                    {selectedTypes.join(" + ")} on {new Date(selectedDate).toDateString()}
                                </div>
                                <div className="font-display text-2xl text-primary">৳{total}</div>
                            </div>
                            <Button size="lg" onClick={() => setStep("pay")} className="gap-2">
                                Continue <ChevronRight className="size-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </AppShell>
    );
}