import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Pencil, Plus, Calendar, Clock, Utensils, TrendingUp, CheckCircle2, User, Hourglass } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { formatTime12, isBookingOpen } from "@/lib/utils";
import { PageHeader } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { AppShell } from "@/components/AppShell";
import {
    Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import type { MealConfig, MealType } from "@/types";

interface MealConfigsApi {
    getMealConfigs: (f?: object) => Promise<{ data: MealConfig[] }>;
    createMealConfig: (payload: unknown) => Promise<unknown>;
    updateMealConfig: (id: string, payload: unknown) => Promise<unknown>;
}

interface FormState {
    id?: string;
    mealDate: string;
    mealType: MealType;
    mealMenu: string;
    mealPrice: number;
    cutTokenBefore: string;
    tokenExpires: string;
    isActive: boolean;
    feastNote: string;
}

const emptyForm = (type: MealType = "LUNCH"): FormState => ({
    mealDate: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
    mealType: type,
    mealMenu: "",
    mealPrice: 30,
    cutTokenBefore: type === "LUNCH" ? "10:00" : "17:00",
    tokenExpires: type === "LUNCH" ? "15:00" : "22:00",
    isActive: true,
    feastNote: "",
});

function formatDateTime(iso?: string) {
    if (!iso) return "?";
    return new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

export function MealConfigsPage({ api }: { api: MealConfigsApi }) {
    const { user, userData } = useAuth();
    const [configs, setConfigs] = useState<MealConfig[]>([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    // ✅ Use a separate key to force Switch remount when dialog opens with new config
    const [dialogKey, setDialogKey] = useState(0);
    const [form, setForm] = useState<FormState>(emptyForm());

    const load = async () => {
        try {
            const res = await api.getMealConfigs();
            setConfigs([...res.data].sort((a, b) => (a.mealDate < b.mealDate ? 1 : -1)));
        } catch (e) {
            console.error(e);
            toast.error("Failed to load meal configs");
        }
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (!user) return null;

    const openCreate = () => {
        setForm(emptyForm());
        setDialogKey((k) => k + 1); // force remount
        setDialogOpen(true);
    };

    const openEdit = (c: MealConfig) => {
        setForm({
            id: c.id,
            mealDate: c.mealDate,
            mealType: c.mealType,
            mealMenu: c.mealMenu,
            mealPrice: c.mealPrice,
            cutTokenBefore: c.cutTokenBefore,
            tokenExpires: c.tokenExpires,
            isActive: c.isActive,
            feastNote: c.feastNote || "",
        });
        setDialogKey((k) => k + 1); // force remount
        setDialogOpen(true);
    };

    const handleSave = async () => {
        try {
            if (form.id) {
                await api.updateMealConfig(form.id, {
                    mealMenu: form.mealMenu,
                    mealPrice: form.mealPrice,
                    cutTokenBefore: form.cutTokenBefore,
                    tokenExpires: form.tokenExpires,
                    isActive: form.isActive,
                    feastNote: form.feastNote || undefined,
                });
                toast.success("Meal config updated");
            } else {
                await api.createMealConfig({
                    mealDate: form.mealDate,
                    mealType: form.mealType,
                    mealMenu: form.mealMenu,
                    mealPrice: form.mealPrice,
                    cutTokenBefore: form.cutTokenBefore,
                    tokenExpires: form.tokenExpires,
                    isActive: form.isActive,
                    feastNote: form.feastNote || undefined,
                });
                toast.success("Meal config created");
            }
            setDialogOpen(false);
            load();
        } catch (e: any) {
            toast.error(e?.response?.data?.message ?? "Failed to save meal config");
        }
    };

    return (
        <AppShell>
            <div>
                <PageHeader
                    title="Meal Configurations"
                    subtitle={
                        userData?.hallShortName
                            ? `Manage meals for ${userData.hallShortName}.`
                            : "Manage meal configurations."
                    }
                    actions={
                        <Button onClick={openCreate} className="gap-2">
                            <Plus className="size-4" /> New meal
                        </Button>
                    }
                />

                {configs.length === 0 && (
                    <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
                        No meal configurations yet.
                    </div>
                )}

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {configs.map((c) => {
                        const open = isBookingOpen(c);
                        return (
                            <div key={c.id} className="rounded-xl border border-border bg-card p-5 shadow-sm flex flex-col gap-3">
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <Badge variant={c.mealType === "LUNCH" ? "default" : "secondary"}>{c.mealType}</Badge>
                                            <Badge variant="outline">{c.hallShortName}</Badge>
                                            {!c.isActive ? (
                                                <Badge variant="outline">Inactive</Badge>
                                            ) : open ? (
                                                <Badge className="bg-success text-success-foreground">Open</Badge>
                                            ) : (
                                                <Badge variant="secondary">Closed</Badge>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 text-base font-display">
                                            <Calendar className="size-4 text-muted-foreground" />
                                            {new Date(c.mealDate).toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
                                        </div>
                                    </div>
                                    <Button size="sm" variant="ghost" onClick={() => openEdit(c)}>
                                        <Pencil className="size-4" />
                                    </Button>
                                </div>

                                <div className="flex items-start gap-2 text-sm">
                                    <Utensils className="size-4 text-muted-foreground mt-0.5 shrink-0" />
                                    <span className="font-medium">{c.mealMenu}</span>
                                </div>

                                {c.feastNote && (
                                    <div className="text-sm italic text-accent-foreground bg-accent/40 rounded-md px-3 py-1.5">
                                        🎉 {c.feastNote}
                                    </div>
                                )}

                                <div className="flex items-center justify-between">
                                    <div className="font-display text-2xl text-primary">৳{c.mealPrice}</div>
                                    <div className="flex items-center gap-1 text-sm text-destructive font-medium">
                                        <Clock className="size-4" /> Cut by {formatTime12(c.cutTokenBefore)}
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border">
                                    <div className="flex items-center gap-2 text-sm">
                                        <TrendingUp className="size-4 text-primary" />
                                        <span><span className="font-semibold">{c.totalTokensSold ?? '-'}</span> <span className="text-muted-foreground">sold</span></span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Hourglass className="size-4 text-warning" />
                                        <span><span className="font-semibold">{c.totalTokenPending ?? '-'}</span> <span className="text-muted-foreground">pending</span></span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <CheckCircle2 className="size-4 text-success" />
                                        <span><span className="font-semibold">{c.totalTokensUsed ?? '-'}</span> <span className="text-muted-foreground">used</span></span>
                                    </div>
                                </div>

                                <div className="pt-3 border-t border-border text-xs text-muted-foreground space-y-1">
                                    <div className="flex items-center gap-1.5">
                                        <User className="size-3" />
                                        Created by <span className="font-medium text-foreground">{c.createdByName}</span>
                                        {c.createdAt && <> · {formatDateTime(c.createdAt)}</>}
                                    </div>
                                    {c.updatedByName && (
                                        <div className="flex items-center gap-1.5">
                                            <Pencil className="size-3" />
                                            Updated by <span className="font-medium text-foreground">{c.updatedByName}</span>
                                            {c.updatedAt && <> · {formatDateTime(c.updatedAt)}</>}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* ✅ key prop forces full remount when opening a different config */}
                <Dialog key={dialogKey} open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{form.id ? "Edit meal config" : "Create meal config"}</DialogTitle>
                        </DialogHeader>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label>Meal date</Label>
                                <Input
                                    type="date"
                                    disabled={!!form.id}
                                    value={form.mealDate}
                                    onChange={(e) => setForm((prev) => ({ ...prev, mealDate: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Meal type</Label>
                                <Select
                                    value={form.mealType}
                                    disabled={!!form.id}
                                    onValueChange={(v) => {
                                        const mt = v as MealType;
                                        setForm((prev) => ({
                                            ...prev,
                                            mealType: mt,
                                            cutTokenBefore: mt === "LUNCH" ? "10:00" : "17:00",
                                            tokenExpires: mt === "LUNCH" ? "15:00" : "22:00",
                                        }));
                                    }}
                                >
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="LUNCH">Lunch</SelectItem>
                                        <SelectItem value="DINNER">Dinner</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5 col-span-2">
                                <Label>Menu</Label>
                                <Input
                                    placeholder="Rice, Fish, Dal"
                                    value={form.mealMenu}
                                    onChange={(e) => setForm((prev) => ({ ...prev, mealMenu: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Price (BDT)</Label>
                                <Input
                                    type="number"
                                    value={form.mealPrice}
                                    onChange={(e) => setForm((prev) => ({ ...prev, mealPrice: Number(e.target.value) }))}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Active</Label>
                                <div className="h-10 flex items-center gap-3">
                                    {/* ✅ functional updater avoids stale closure; key forces remount */}
                                    <Switch
                                        key={`active-${form.id ?? "new"}-${dialogKey}`}
                                        checked={form.isActive}
                                        onCheckedChange={(v) => setForm((prev) => ({ ...prev, isActive: v }))}
                                    />
                                    <span className="text-sm text-muted-foreground">
                                        {form.isActive ? "Active" : "Inactive"}
                                    </span>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label>Cut token before</Label>
                                <Input
                                    type="time"
                                    value={form.cutTokenBefore}
                                    onChange={(e) => setForm((prev) => ({ ...prev, cutTokenBefore: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Token expires</Label>
                                <Input
                                    type="time"
                                    value={form.tokenExpires}
                                    onChange={(e) => setForm((prev) => ({ ...prev, tokenExpires: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-1.5 col-span-2">
                                <Label>Feast note (optional)</Label>
                                <Input
                                    value={form.feastNote}
                                    onChange={(e) => setForm((prev) => ({ ...prev, feastNote: e.target.value }))}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleSave}>Save</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppShell>
    );
}
