import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { PageHeader } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AppShell } from "@/components/AppShell";

interface ProfileApi {
    getProfile: () => Promise<{ data: Record<string, any> }>;
    updateProfile: (data: unknown) => Promise<{ data: Record<string, any> }>;
}

export function ProfilePage({ api, isStudent }: { api: ProfileApi; isStudent: boolean }) {
    const { user, refreshUserData } = useAuth();
    const [editing, setEditing] = useState(false);
    const [profile, setProfile] = useState<Record<string, any> | null>(null);
    const [form, setForm] = useState<{ fullName: string; roomNumber?: string; phone?: string }>({
        fullName: "",
        roomNumber: "",
        phone: "",
    });

    useEffect(() => {
        if (!user) return;
        (async () => {
            try {
                const res = await api.getProfile();
                const p = res.data;
                setProfile(p);
                setForm({ fullName: p.fullName, roomNumber: p.roomNumber || "", phone: p.phone || "" });
            } catch (e) {
                console.error(e);
                toast.error("Failed to load profile");
            }
        })();
    }, [user]);

    if (!user || !profile) return null;

    const handleSave = async () => {
        try {
            const payload = isStudent
                ? { fullName: form.fullName, roomNumber: form.roomNumber }
                : { fullName: form.fullName, phone: form.phone };
            const res = await api.updateProfile(payload);
            setProfile(res.data);
            await refreshUserData();
            setEditing(false);
            toast.success("Profile updated");
        } catch (e) {
            console.error(e);
            toast.error("Failed to update profile");
        }
    };

    return (
       <AppShell>
           <div>
               <PageHeader
                   title="My Profile"
                   subtitle="Manage your personal information."
                   actions={
                       editing ? (
                           <>
                               <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
                               <Button onClick={handleSave}>Save</Button>
                           </>
                       ) : (
                           <Button onClick={() => setEditing(true)}>Edit profile</Button>
                       )
                   }
               />

               <div className="rounded-xl border border-border bg-card p-6 max-w-2xl">
                   <div className="flex items-center gap-4 pb-6 border-b border-border">
                       <div className="size-16 rounded-full bg-primary text-primary-foreground grid place-items-center font-display text-2xl">
                           {profile.fullName?.[0]}
                       </div>
                       <div>
                           <div className="font-display text-2xl">{profile.fullName}</div>
                           <div className="text-sm text-muted-foreground">{profile.email}</div>
                           <div className="mt-2 flex gap-2">
                               <Badge variant={profile.isActive ? "default" : "secondary"}>
                                   {profile.isActive ? "Active" : "Suspended"}
                               </Badge>
                               <Badge variant="outline">{isStudent ? "Student" : profile.role?.replace("_", " ") ?? "Admin"}</Badge>
                           </div>
                       </div>
                   </div>

                   <div className="grid grid-cols-2 gap-4 mt-6">
                       {isStudent ? (
                           <>
                               <Field label="Student ID" value={profile.studentId} />
                               <Field label="Hall" value={profile.hallShortName} />
                               <Field label="Department" value={profile.department} className="col-span-2" />
                               <Field label="Gender" value={profile.gender} />
                               <div>
                                   <Label className="text-xs uppercase tracking-wider text-muted-foreground">Room No.</Label>
                                   {editing ? (
                                       <Input
                                           value={form.roomNumber || ""}
                                           onChange={(e) => setForm({ ...form, roomNumber: e.target.value })}
                                       />
                                   ) : (
                                       <div className="font-medium mt-1">{profile.roomNumber || "—"}</div>
                                   )}
                               </div>
                               <div className="col-span-2">
                                   <Label className="text-xs uppercase tracking-wider text-muted-foreground">Full Name</Label>
                                   {editing ? (
                                       <Input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
                                   ) : (
                                       <div className="font-medium mt-1">{profile.fullName}</div>
                                   )}
                               </div>
                           </>
                       ) : (
                           <>
                               <Field label="Hall" value={profile.hallShortName} />
                               <Field label="Role" value={profile.role} />
                               <div className="col-span-2">
                                   <Label className="text-xs uppercase tracking-wider text-muted-foreground">Full Name</Label>
                                   {editing ? (
                                       <Input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
                                   ) : (
                                       <div className="font-medium mt-1">{profile.fullName}</div>
                                   )}
                               </div>
                               <div className="col-span-2">
                                   <Label className="text-xs uppercase tracking-wider text-muted-foreground">Phone</Label>
                                   {editing ? (
                                       <Input value={form.phone || ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                                   ) : (
                                       <div className="font-medium mt-1">{profile.phone || "—"}</div>
                                   )}
                               </div>
                           </>
                       )}
                       <Field label="Joined" value={new Date(profile.createdAt).toLocaleDateString()} className="col-span-2" />
                   </div>
               </div>
           </div>
       </AppShell>
    );
}

function Field({ label, value, className = "" }: { label: string; value: string; className?: string }) {
    return (
        <div className={className}>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
            <div className="font-medium mt-1">{value}</div>
        </div>
    );
}