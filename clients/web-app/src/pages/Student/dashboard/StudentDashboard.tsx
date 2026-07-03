import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { mealTokenAPI } from "@/services/api";
import { AppShell } from "@/components/AppShell";
import { WelcomeBanner } from "./WelcomeBanner";
import { StudentStats } from "./StudentStats";
import { StudentQuickActions } from "./QuickActions";

export function StudentDashboard() {
    const { user, userData } = useAuth();

    const { data: stats = { activeTokens: 0 } } = useQuery({
        queryKey: ["studentDashboardStats", user?.uid],
        queryFn: async () => {
            const tokensRes = await mealTokenAPI.getMyTokens();
            const tokens = tokensRes.data ?? [];

            return {
                activeTokens: tokens.filter((t: any) => t.tokenStatus === "APPROVED").length,
            };
        },
        enabled: !!user,
        staleTime: 60 * 1000,
    });

    if (!user) return null;

    return (
        <AppShell>
            <WelcomeBanner
                fullName={userData?.fullName ?? user?.displayName ?? ""}
                hallShortName={userData?.hallShortName ?? ""}
            />
            <StudentStats {...stats} />
            <StudentQuickActions />
        </AppShell>
    );
}