import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { mealTokenAPI, paymentAPI } from "@/services/api";
import { AppShell } from "@/components/AppShell";
import { WelcomeBanner } from "./WelcomeBanner";
import { StudentStats } from "./StudentStats";
import { StudentQuickActions } from "./QuickActions";

export function StudentDashboard() {
    const { user, userData } = useAuth();
    const [stats, setStats] = useState({ activeTokens: 0, payments: 0, totalSpent: 0 });

    useEffect(() => {
        if (!user) return;
        (async () => {
            try {
                const [tokensRes, paymentsRes] = await Promise.all([
                    mealTokenAPI.getMyTokens(),
                    paymentAPI.getMyPayments(),
                ]);
                const tokens = tokensRes.data ?? [];
                const payments = paymentsRes.data ?? [];
                setStats({
                    activeTokens: tokens.filter((t: any) => t.tokenStatus === "APPROVED").length,
                    payments: payments.length,
                    totalSpent: payments
                        .filter((p: any) => p.paymentStatus === "COMPLETED")
                        .reduce((acc: number, p: any) => acc + p.totalAmount, 0),
                });
            } catch (e) {
                console.error("Failed to load student dashboard", e);
            }
        })();
    }, [user]);

    if (!user) return null;

    return (
        <AppShell>
            <WelcomeBanner fullName={userData?.fullName ?? user?.displayName ?? ""} hallShortName={userData?.hallShortName ?? ""} />
            <StudentStats {...stats} />
            <StudentQuickActions />
        </AppShell>
    );
}
