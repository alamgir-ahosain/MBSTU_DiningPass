import { useEffect,  useState } from "react";
import { toast } from "sonner";
import { Building2, Pencil, Plus, Power } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { hallAPI, superAdminAPI } from "@/services/api";
import { PageHeader } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
    Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import type { Admin, Hall } from "@/types";
import { AppShell } from "@/components/AppShell";
import axios from "axios";


type FormState = {
    id?: string;
    fullName: string;
    shortName: string;
    genderType: "MALE" | "FEMALE";
    bkashNumber: string;
    nagadNumber: string;
    hallAdminId: string;
};

const EMPTY: FormState = {
    fullName: "", shortName: "", genderType: "MALE", bkashNumber: "", nagadNumber: "", hallAdminId: "",
};

export function SuperAdminHalls() {
    const { user, role, loading } = useAuth();
    const [halls, setHalls] = useState<Hall[]>([]);
    const [hallAdmins, setHallAdmins] = useState<Admin[]>([]);
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState<FormState>(EMPTY);

    const load = async () => {
        try {
            const [hallsRes, adminsRes] = await Promise.all([
                hallAPI.getAll(),
                superAdminAPI.getAllAdmins({ role: "HALL_ADMIN" }),
            ]);
            setHalls([...hallsRes.data].sort((a: Hall, b: Hall) => a.shortName.localeCompare(b.shortName)));
            setHallAdmins(adminsRes.data ?? []);
        } catch (e) {
            console.error(e);
            toast.error("Failed to load halls");
        }
    };

    useEffect(() => { load(); }, []);


    if (loading) {
        return null;
    }

    if (!user || role !== "SUPER_ADMIN") {
        return (
            <div className="text-sm text-muted-foreground">
                Only super admins can manage halls.
            </div>
        );
    }

    const openCreate = () => { setForm(EMPTY); setOpen(true); };
    const openEdit = (h: Hall) => {
        setForm({
            id: h.id,
            fullName: h.fullName,
            shortName: h.shortName,
            genderType: h.genderType,
            bkashNumber: h.bkashNumber,
            nagadNumber: h.nagadNumber ?? "",
            hallAdminId: h.hallAdminId ?? "",
        });
        setOpen(true);
    };

    const onSave = async () => {
        if (form.fullName.trim().length < 2 || form.shortName.trim().length < 2) {
            return toast.error("Full name and short name are required.");
        }
        if (!form.bkashNumber.trim()) return toast.error("bKash number is required.");

        const payload = {
            fullName: form.fullName.trim(),
            shortName: form.shortName.trim(),
            genderType: form.genderType,
            bkashNumber: form.bkashNumber.trim(),
            nagadNumber: form.nagadNumber.trim() || undefined,
            hallAdminId: form.hallAdminId || undefined,
        };

        try {
            if (form.id) {
                await hallAPI.updateHall(form.id, payload);
                toast.success("Hall updated");
            } else {
                await hallAPI.createHall({ ...payload, isActive: true });
                toast.success("Hall created");
            }
            setOpen(false);
            load();
        }
        catch (e: unknown) {
            const message = axios.isAxiosError(e) ? e.response?.data?.message : undefined;
            toast.error(message ?? "Failed to save hall");
        }
    };

    const toggleStatus = async (h: Hall) => {
        try {
            if (h.isActive) await hallAPI.suspendHall(h.id);
            else await hallAPI.activateHall(h.id);
            toast.success(h.isActive ? "Hall suspended" : "Hall activated");
            load();
        } catch (e) {
            console.error(e);
            toast.error("Failed to update hall status");
        }
    };

    return (
      <AppShell>
          <div>
              <PageHeader
                  title="Hall Management"
                  subtitle="Create, edit, and suspend residential halls."
                  actions={<Button onClick={openCreate}><Plus className="size-4" /> New Hall</Button>}
              />

              <div className="rounded-xl border border-border bg-card overflow-hidden">
                  <Table>
                      <TableHeader>
                          <TableRow>
                              <TableHead>Hall</TableHead>
                              <TableHead>Short</TableHead>
                              <TableHead>Gender</TableHead>
                              <TableHead>bKash</TableHead>
                              <TableHead>Nagad</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Created</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                      </TableHeader>
                      <TableBody>
                          {halls.length === 0 && (
                              <TableRow>
                                  <TableCell colSpan={8} className="text-center text-muted-foreground py-10">
                                      <Building2 className="size-8 mx-auto mb-2 opacity-50" /> No halls yet.
                                  </TableCell>
                              </TableRow>
                          )}
                          {halls.map((h) => (
                              <TableRow key={h.id}>
                                  <TableCell className="font-medium">{h.fullName}</TableCell>
                                  <TableCell className="font-mono text-xs">{h.shortName}</TableCell>
                                  <TableCell>{h.genderType}</TableCell>
                                  <TableCell className="font-mono text-xs">{h.bkashNumber}</TableCell>
                                  <TableCell className="font-mono text-xs">{h.nagadNumber ?? "—"}</TableCell>
                                  <TableCell>
                                      <Badge variant={h.isActive ? "default" : "secondary"}>{h.isActive ? "ACTIVE" : "SUSPENDED"}</Badge>
                                  </TableCell>
                                  <TableCell className="text-xs text-muted-foreground">{new Date(h.createdAt).toLocaleDateString()}</TableCell>
                                  <TableCell className="text-right space-x-1">
                                      <Button size="sm" variant="outline" onClick={() => openEdit(h)}><Pencil className="size-3.5" /> Edit</Button>
                                      <Button size="sm" variant="ghost" onClick={() => toggleStatus(h)}>
                                          <Power className="size-3.5" /> {h.isActive ? "Suspend" : "Activate"}
                                      </Button>
                                  </TableCell>
                              </TableRow>
                          ))}
                      </TableBody>
                  </Table>
              </div>

              <Dialog open={open} onOpenChange={setOpen}>
                  <DialogContent className="max-w-lg">
                      <DialogHeader><DialogTitle>{form.id ? "Edit Hall" : "Create Hall"}</DialogTitle></DialogHeader>
                      <div className="space-y-3">
                          <div className="space-y-1.5">
                              <Label>Full name</Label>
                              <Input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1.5">
                                  <Label>Short name</Label>
                                  <Input value={form.shortName} onChange={(e) => setForm({ ...form, shortName: e.target.value.toUpperCase() })} />
                              </div>
                              <div className="space-y-1.5">
                                  <Label>Gender</Label>
                                  <Select value={form.genderType} onValueChange={(v) => setForm({ ...form, genderType: v as "MALE" | "FEMALE" })}>
                                      <SelectTrigger><SelectValue /></SelectTrigger>
                                      <SelectContent>
                                          <SelectItem value="MALE">MALE</SelectItem>
                                          <SelectItem value="FEMALE">FEMALE</SelectItem>
                                      </SelectContent>
                                  </Select>
                              </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1.5">
                                  <Label>bKash number</Label>
                                  <Input value={form.bkashNumber} onChange={(e) => setForm({ ...form, bkashNumber: e.target.value })} />
                              </div>
                              <div className="space-y-1.5">
                                  <Label>Nagad number (optional)</Label>
                                  <Input value={form.nagadNumber} onChange={(e) => setForm({ ...form, nagadNumber: e.target.value })} />
                              </div>
                          </div>
                          <div className="space-y-1.5">
                              <Label>Hall admin (provost)</Label>
                              <Select value={form.hallAdminId || "none"} onValueChange={(v) => setForm({ ...form, hallAdminId: v === "none" ? "" : v })}>
                                  <SelectTrigger><SelectValue placeholder="Unassigned" /></SelectTrigger>
                                  <SelectContent>
                                      <SelectItem value="none">Unassigned</SelectItem>
                                      {hallAdmins.map((a) => (
                                          <SelectItem key={a.id} value={a.id}>{a.fullName} — {a.email}</SelectItem>
                                      ))}
                                  </SelectContent>
                              </Select>
                          </div>
                      </div>
                      <DialogFooter>
                          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                          <Button onClick={onSave}>{form.id ? "Save changes" : "Create hall"}</Button>
                      </DialogFooter>
                  </DialogContent>
              </Dialog>
          </div>
      </AppShell>
    );
}