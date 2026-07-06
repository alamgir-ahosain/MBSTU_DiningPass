import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Power, UserCog } from "lucide-react";
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

type FormState = { fullName: string; email: string; phone: string; password: string; hallShortName: string };
const EMPTY: FormState = { fullName: "", email: "", phone: "", password: "password", hallShortName: "" };

export function SuperAdminAdmins() {
    const { user, role, loading } = useAuth();
    const [admins, setAdmins] = useState<Admin[]>([]);
    const [halls, setHalls] = useState<Hall[]>([]);
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState<FormState>(EMPTY);

    const load = async () => {
        try {
            const [adminsRes, hallsRes] = await Promise.all([
                superAdminAPI.getAllAdmins({ role: "HALL_ADMIN" }),
                hallAPI.getAll({ isActive: true }),
            ]);
            setAdmins(adminsRes.data ?? []);
            setHalls(hallsRes.data ?? []);
        } catch (e) {
            console.error(e);
            toast.error("Failed to load hall admins");
        }
    };

    useEffect(() => {
        let ignore = false;

        (async () => {
            try {
                const [adminsRes, hallsRes] = await Promise.all([
                    superAdminAPI.getAllAdmins({ role: "HALL_ADMIN" }),
                    hallAPI.getAll({ isActive: true }),
                ]);
                if (!ignore) {
                    setAdmins(adminsRes.data ?? []);
                    setHalls(hallsRes.data ?? []);
                }
            } catch (e) {
                console.error(e);
                if (!ignore) toast.error("Failed to load hall admins");
            }
        })();

        return () => { ignore = true; };
    }, []);

    if (loading) {
        return null;
    }

    if (!user || role !== "SUPER_ADMIN") {
        return <div className="text-sm text-muted-foreground">Only super admins can manage hall admins.</div>;
    }

    const onCreate = async () => {
        if (form.fullName.trim().length < 2 || !form.email.includes("@")) {
            return toast.error("Valid name and email are required.");
        }
        if (form.password.length < 6) return toast.error("Password must be at least 6 characters.");
        if (!form.hallShortName) return toast.error("Assign a hall.");

        try {
            await superAdminAPI.createAdmin({
                fullName: form.fullName.trim(),
                email: form.email.trim().toLowerCase(),
                phone: form.phone.trim() || undefined,
                password: form.password,
                role: "HALL_ADMIN",
                hallShortName: form.hallShortName,
            });
            toast.success("Hall admin created");
            setOpen(false);
            setForm(EMPTY);
            load();
        } catch (e: unknown) {
            const message = axios.isAxiosError(e) ? e.response?.data?.message : undefined;
            toast.error(message ?? "Failed to create hall admin. Please try again later.");
        }
    };

    const toggleStatus = async (a: Admin) => {
        try {
            if (a.isActive) await superAdminAPI.suspendAdmin(a.id);
            else await superAdminAPI.activateAdmin(a.id);
            toast.success(a.isActive ? "Suspended" : "Activated");
            load();
        } catch (e: unknown) {
            const message = axios.isAxiosError(e) ? e.response?.data?.message : undefined;
            toast.error(message ?? "Failed to update status");
        }
    };

    return (
       <AppShell>
           <div>
               <PageHeader
                   title="Hall Admins"
                   subtitle="Provost accounts assigned to each hall."
                   actions={<Button onClick={() => { setForm(EMPTY); setOpen(true); }}><Plus className="size-4" /> New Hall Admin</Button>}
               />

               <div className="rounded-xl border border-border bg-card overflow-hidden">
                   <Table>
                       <TableHeader>
                           <TableRow>
                               <TableHead>Name</TableHead>
                               <TableHead>Email</TableHead>
                               <TableHead>Phone</TableHead>
                               <TableHead>Hall</TableHead>
                               <TableHead>Status</TableHead>
                               <TableHead>Created</TableHead>
                               <TableHead className="text-right">Actions</TableHead>
                           </TableRow>
                       </TableHeader>
                       <TableBody>
                           {admins.length === 0 && (
                               <TableRow>
                                   <TableCell colSpan={7} className="text-center text-muted-foreground py-10">
                                       <UserCog className="size-8 mx-auto mb-2 opacity-50" /> No hall admins yet.
                                   </TableCell>
                               </TableRow>
                           )}
                           {admins.map((a) => (
                               <TableRow key={a.id}>
                                   <TableCell className="font-medium">{a.fullName}</TableCell>
                                   <TableCell className="text-xs">{a.email}</TableCell>
                                   <TableCell className="text-xs">{a.phone ?? "—"}</TableCell>
                                   <TableCell>{a.hallShortName}</TableCell>
                                   <TableCell><Badge variant={a.isActive ? "default" : "secondary"}>{a.isActive ? "ACTIVE" : "SUSPENDED"}</Badge></TableCell>
                                   <TableCell className="text-xs text-muted-foreground">{new Date(a.createdAt).toLocaleDateString()}</TableCell>
                                   <TableCell className="text-right">
                                       <Button size="sm" variant="ghost" onClick={() => toggleStatus(a)}>
                                           <Power className="size-3.5" /> {a.isActive ? "Suspend" : "Activate"}
                                       </Button>
                                   </TableCell>
                               </TableRow>
                           ))}
                       </TableBody>
                   </Table>
               </div>

               <Dialog open={open} onOpenChange={setOpen}>
                   <DialogContent className="max-w-lg">
                       <DialogHeader><DialogTitle>Create Hall Admin</DialogTitle></DialogHeader>
                       <div className="space-y-3">
                           <div className="space-y-1.5">
                               <Label>Full name</Label>
                               <Input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
                           </div>
                           <div className="grid grid-cols-2 gap-3">
                               <div className="space-y-1.5">
                                   <Label>Email</Label>
                                   <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                               </div>
                               <div className="space-y-1.5">
                                   <Label>Phone</Label>
                                   <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                               </div>
                           </div>
                           <div className="grid grid-cols-2 gap-3">
                               <div className="space-y-1.5">
                                   <Label>Temporary password</Label>
                                   <Input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                               </div>
                               <div className="space-y-1.5">
                                   <Label>Assigned hall</Label>
                                   <Select value={form.hallShortName} onValueChange={(v) => setForm({ ...form, hallShortName: v })}>
                                       <SelectTrigger><SelectValue placeholder="Select hall" /></SelectTrigger>
                                       <SelectContent>
                                           {halls.map((h) => (
                                               <SelectItem key={h.shortName} value={h.shortName}>{h.shortName} — {h.fullName}</SelectItem>
                                           ))}
                                       </SelectContent>
                                   </Select>
                               </div>
                           </div>
                       </div>
                       <DialogFooter>
                           <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                           <Button onClick={onCreate}>Create</Button>
                       </DialogFooter>
                   </DialogContent>
               </Dialog>
           </div>
       </AppShell>
    );
}