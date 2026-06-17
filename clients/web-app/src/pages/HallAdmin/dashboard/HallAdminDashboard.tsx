import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { hallAdminAPI, hallStaffAPI } from "@/services/api";
import { todayStr } from "@/lib/utils";
import { WelcomeBanner } from "./WelcomeBanner";
import { AdminStats } from "./AdminStats";
import { TodaysMeals } from "./TodaysMeals";
import type { MealConfig } from "@/types";
import { AppShell } from "@/components/AppShell";

export function HallAdminDashboard() {
  const { user, role, userData } = useAuth();

  const [data, setData] = useState<{
    activeStaff: number;
    totalStaff: number;
    activeStudents: number;
    totalStudents: number;
    lunch?: MealConfig;
    dinner?: MealConfig;
  } | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const today = todayStr();
        const [staffRes, studentsRes, configsRes] = await Promise.all([
          hallAdminAPI.getHallStaff(),
          hallStaffAPI.getStudents(),
          hallAdminAPI.getMealConfigs({ mealDate: today }),
        ]);

        const staff = staffRes.data ?? [];
        const students = studentsRes.data ?? [];
        const configs: MealConfig[] = configsRes.data ?? [];
        setData({
          activeStaff: staff.filter((x: any) => x.isActive).length,
          totalStaff: staff.length,
          activeStudents: students.length,
          totalStudents: students.length,
          lunch: configs.find((c) => c.mealType === "LUNCH"),
          dinner: configs.find((c) => c.mealType === "DINNER"),
        });
      } catch (e) {
        console.error("Failed to load dashboard", e);
      }
    })();
  }, [user, role]);

  if (!user || !data) return null;

  const roleLabel = role === "HALL_ADMIN" ? "Hall Admin Dashboard" : "Hall Staff Dashboard";

  return (
      <AppShell>
        <div>
          <WelcomeBanner fullName={userData?.fullName ?? user.displayName ?? ""} hallShortName={userData?.hallShortName ?? ""} roleLabel={roleLabel} />
          <AdminStats
              activeStaff={data.activeStaff}
              totalStaff={data.totalStaff}
              activeStudents={data.activeStudents}
              totalStudents={data.totalStudents}
              lunch={data.lunch}
              dinner={data.dinner}
          />
          <div className="grid md:grid-cols-2 gap-6">
            <TodaysMeals lunch={data.lunch} dinner={data.dinner} />
          </div>
        </div>
      </AppShell>
  );
}
