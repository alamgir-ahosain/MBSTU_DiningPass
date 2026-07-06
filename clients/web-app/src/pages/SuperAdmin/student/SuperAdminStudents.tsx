import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { superAdminAPI } from "@/services/api";
import { PageHeader } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { StudentProfile } from "@/types";
import { AppShell } from "@/components/AppShell";
import type { AxiosResponse } from "axios";

// Normalizes whatever shape the API returns into a plain StudentProfile[].
// Handles: res.data being the array directly, or nested under
// res.data.students / res.data.data, or missing entirely.

function extractStudents(
    res: AxiosResponse<StudentProfile[] | { students?: StudentProfile[]; data?: StudentProfile[] }>
): StudentProfile[] {
    const payload = res.data;

    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.students)) return payload.students;
    if (Array.isArray(payload?.data)) return payload.data;

    return [];
}

export function SuperAdminStudents() {
    const { user } = useAuth();
    const [students, setStudents] = useState<StudentProfile[]>([]);
    const [q, setQ] = useState("");
    const [confirm, setConfirm] = useState<{ id: string; nextActive: boolean } | null>(null);

    const load = async () => {
        try {
            const res = await superAdminAPI.getAllStudents(q.trim() ? { search: q.trim() } : {});
            setStudents(extractStudents(res));
        } catch (e) {
            console.error(e);
            toast.error("Failed to load students");
            setStudents([]);
        }
    };

    useEffect(() => {
        const t = setTimeout(load, 300);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [q]);

    if (!user) return null;

    const toggleStatus = async () => {
        if (!confirm) return;
        try {
            await superAdminAPI.suspendStudent(confirm.id);
            toast.success(`Student ${confirm.nextActive ? "activated" : "suspended"}`);
            load();
        } catch (e) {
            console.error(e);
            toast.error("Failed to update student status");
        }
        setConfirm(null);
    };

    return (
        <AppShell>
            <div>
                <PageHeader
                    title="Student Management"
                    subtitle="All students across all halls."
                    actions={
                        <input
                            type="search"
                            placeholder="Search by name, ID, department, hall?"
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            className="h-10 w-64 rounded-md border border-input bg-card px-3 text-sm"
                        />
                    }
                />

                <div className="rounded-xl border border-border bg-card overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Student ID</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Hall</TableHead>
                                <TableHead>Department</TableHead>
                                <TableHead>Room</TableHead>
                                <TableHead>Gender</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Joined</TableHead>
                                <TableHead></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {(students ?? []).map((s) => (
                                <TableRow key={s.id}>
                                    <TableCell className="font-mono text-xs">{s.studentId}</TableCell>
                                    <TableCell>
                                        <div className="font-medium">{s.fullName}</div>
                                        <div className="text-xs text-muted-foreground">{s.email}</div>
                                    </TableCell>
                                    <TableCell>{s.hallShortName}</TableCell>
                                    <TableCell className="text-sm">{s.department}</TableCell>
                                    <TableCell>{s.roomNumber || "?"}</TableCell>
                                    <TableCell>{s.gender}</TableCell>
                                    <TableCell><Badge variant={s.isActive ? "default" : "secondary"}>{s.isActive ? "Active" : "Suspended"}</Badge></TableCell>
                                    <TableCell className="text-sm">{new Date(s.createdAt).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        <Button size="sm" variant={s.isActive ? "outline" : "default"} onClick={() => setConfirm({ id: s.id, nextActive: !s.isActive })}>
                                            {s.isActive ? "Suspend" : "Activate"}
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {(students ?? []).length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={9} className="text-center text-muted-foreground py-8">No students found.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                <AlertDialog open={!!confirm} onOpenChange={(o) => !o && setConfirm(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>{confirm?.nextActive ? "Activate this student?" : "Suspend this student?"}</AlertDialogTitle>
                            <AlertDialogDescription>
                                {confirm?.nextActive
                                    ? "The student will regain access to MBSTU DiningPass."
                                    : "The student will be unable to sign in or cut tokens."}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel variant="outline" size="default">    Cancel </AlertDialogCancel>
                            <AlertDialogAction variant="default" size="default" onClick={toggleStatus}>     Confirm </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </AppShell>
    );
}
