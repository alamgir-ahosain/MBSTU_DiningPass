import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { hallAdminAPI } from "@/services/api";
import { PageHeader } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
    Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import type { Admin } from "@/types";
import { AppShell } from "@/components/AppShell";

export function HallAdminStaff() {
    const { user, userData } = useAuth();
    const [staff, setStaff] = useState<Admin[]>([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [form, setForm] = useState({ fullName: "", email: "", password: "", phone: "" });
    const [err, setErr] = useState<string | null>(null);

    const load = async () => {
        try {
            const res = await hallAdminAPI.getHallStaff();
            setStaff(res.data ?? []);
        } catch (e) {
            console.error(e);
            toast.error("Failed to load staff");
        }
    };

    useEffect(() => { load(); }, []);

    if (!user) return null;

    const handleCreate = async () => {
        setErr(null);
        if (form.password.length < 6) return setErr("Password must be at least 6 characters.");
        try {
            await hallAdminAPI.createHallStaff({
                fullName: form.fullName,
                email: form.email.toLowerCase(),
                password: form.password,
                phone: form.phone || undefined,
                role: "HALL_STAFF",
                hallShortName: userData?.hallShortName,
            });
            setDialogOpen(false);
            setForm({ fullName: "", email: "", password: "", phone: "" });
            toast.success("Staff member created");
            load();
        } catch (e: any) {
            setErr(e?.response?.data?.message ?? "Failed to create staff member.");
        }
    };

    const toggleStatus = async (id: string) => {
        try {
            await hallAdminAPI.toggleHallStaffStatus(id);
            toast.success("Staff status updated");
            load();
        } catch (e) {
            console.error(e);
            toast.error("Failed to update status");
        }
    };

    return (
       <AppShell>
           <div>
               <PageHeader
                   title="Staff Management"
                   subtitle="Manage hall staff for token validation and meal management."
                   actions={<Button onClick={() => setDialogOpen(true)} className="gap-2"><Plus className="size-4" /> Add staff</Button>}
               />

               <div className="rounded-xl border border-border bg-card overflow-hidden">
                   <Table>
                       <TableHeader>
                           <TableRow>
                               <TableHead>Name</TableHead>
                               <TableHead>Email</TableHead>
                               <TableHead>Phone</TableHead>
                               <TableHead>Status</TableHead>
                               <TableHead>Created</TableHead>
                               <TableHead></TableHead>
                           </TableRow>
                       </TableHeader>
                       <TableBody>
                           {staff.map((m) => (
                               <TableRow key={m.id}>
                                   <TableCell className="font-medium">{m.fullName}</TableCell>
                                   <TableCell className="text-sm">{m.email}</TableCell>
                                   <TableCell className="text-sm">{m.phone || "—"}</TableCell>
                                   <TableCell><Badge variant={m.isActive ? "default" : "secondary"}>{m.isActive ? "Active" : "Suspended"}</Badge></TableCell>
                                   <TableCell className="text-sm">{new Date(m.createdAt).toLocaleDateString()}</TableCell>
                                   <TableCell>
                                       <Button size="sm" variant={m.isActive ? "outline" : "default"} onClick={() => toggleStatus(m.id)}>
                                           {m.isActive ? "Suspend" : "Activate"}
                                       </Button>
                                   </TableCell>
                               </TableRow>
                           ))}
                           {staff.length === 0 && (
                               <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No staff members yet.</TableCell></TableRow>
                           )}
                       </TableBody>
                   </Table>
               </div>

               <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                   <DialogContent>
                       <DialogHeader><DialogTitle>Add hall staff</DialogTitle></DialogHeader>
                       <div className="space-y-3">
                           <div className="space-y-1.5">
                               <Label>Full name</Label>
                               <Input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
                           </div>
                           <div className="space-y-1.5">
                               <Label>Email</Label>
                               <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                           </div>
                           <div className="space-y-1.5">
                               <Label>Password</Label>
                               <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                           </div>
                           <div className="space-y-1.5">
                               <Label>Phone (optional)</Label>
                               <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                           </div>

                           <div className="text-xs text-muted-foreground">
                               Role: <span className="font-medium">HALL_STAFF</span> · Hall:{" "}   <span className="font-medium">      {userData?.hallShortName ?? "N/A"}  </span>
                           </div>
                           {err && <div className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md px-3 py-2">{err}</div>}
                       </div>
                       <DialogFooter>
                           <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                           <Button onClick={handleCreate}>Create</Button>
                       </DialogFooter>
                   </DialogContent>
               </Dialog>
           </div>
       </AppShell>
    );
}

