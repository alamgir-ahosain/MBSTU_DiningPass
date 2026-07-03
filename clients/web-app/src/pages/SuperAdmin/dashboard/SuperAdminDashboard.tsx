import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { hallAPI, superAdminAPI } from "@/services/api";
import { WelcomeBanner } from "./WelcomeBanner";
import { SuperAdminStats } from "./SuperAdminStats";
import { SuperAdminQuickActions } from "./QuickActions";
import { AppShell } from "@/components/AppShell";

export function SuperAdminDashboard() {
  const { user, userData } = useAuth();
  const [data, setData] = useState({
    totalHalls: 0,
    allHalls: 0,
    hallAdmins: 0,
    hallStaff: 0,
    students: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [hallsRes, adminsRes, studentsRes] = await Promise.all([
          hallAPI.getAll(),
          superAdminAPI.getAllAdmins(),
          superAdminAPI.getAllStudents(),
        ]);
        const halls = hallsRes.data ?? [];
        const admins = adminsRes.data ?? [];
        const students = studentsRes.data ?? [];
        setData({
          totalHalls: halls.filter((h: any) => h.isActive).length,
          allHalls: halls.length,
          hallAdmins: admins.filter((a: any) => a.role === "HALL_ADMIN").length,
          hallStaff: admins.filter((a: any) => a.role === "HALL_STAFF").length,
          students: students.length,
        });
      } catch (e) {
        console.error("Failed to load super admin dashboard", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (!user) return null;

  return (
   <AppShell>
     <div>

       <WelcomeBanner fullName={userData?.fullName ?? user.displayName ?? ""} roleLabel="Super Admin Dashboard"/>
       {!loading && <SuperAdminStats {...data} />}
       <SuperAdminQuickActions />
     </div>
   </AppShell>
  );
}