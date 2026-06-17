import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { hallStaffAPI } from "@/services/api";
import { todayStr } from "@/lib/utils";
import { WelcomeBanner } from "@/pages/HallAdmin/dashboard/WelcomeBanner";
import { TodaysMeals } from "@/pages/HallAdmin/dashboard/TodaysMeals";
import { RecentPayments } from "@/pages/HallAdmin/dashboard/RecentPayments";
import { AppShell } from "@/components/AppShell";
import { Stat } from "@/components/Stat";
import type { MealConfig, Payment } from "@/types";

export function HallStaffDashboard() {
    const { user, userData } = useAuth();
    const [data, setData] = useState<{
        totalTokensToday: number;
        pendingPayments: number;
        lunch?: MealConfig;
        dinner?: MealConfig;
        recentPayments: Payment[];
    } | null>(null);

    useEffect(() => {
        if (!user) return;
        (async () => {
            try {
                const today = todayStr();

                // Run independent calls separately so one failure doesn't block others
                const [configsRes, paymentsRes] = await Promise.all([
                    hallStaffAPI.getMealConfigs({ mealDate: today }),
                    hallStaffAPI.getPayments({ mealDate: today }).catch(() => ({ data: [] })),
                ]);

                const configs: MealConfig[] = configsRes.data ?? [];
                const allPayments: Payment[] = paymentsRes.data ?? [];

                const recentPayments = [...allPayments]
                    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
                    .slice(0, 5);

                const lunch = configs.find((c) => c.mealType === "LUNCH");
                const dinner = configs.find((c) => c.mealType === "DINNER");

                setData({
                    totalTokensToday: (lunch?.tokensSold ?? 0) + (dinner?.tokensSold ?? 0),
                    pendingPayments: allPayments.filter((p) => p.paymentStatus === "PENDING").length,
                    lunch,
                    dinner,
                    recentPayments,
                });
            } catch (e) {
                console.error("Failed to load staff dashboard", e);
                // Still show the shell with empty state instead of blank screen
                setData({
                    totalTokensToday: 0,
                    pendingPayments: 0,
                    recentPayments: [],
                });
            }
        })();
    }, [user]);

    if (!user) return null;

    return (
        <AppShell>
            <div>
                <WelcomeBanner
                    fullName={userData?.fullName ?? user.displayName ?? ""}
                    hallShortName={userData?.hallShortName ?? ""}
                    roleLabel="Hall Staff Dashboard"
                />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    <Stat
                        label="Today's Tokens Sold"
                        value={data?.totalTokensToday ?? "—"}
                        tone={data && data.totalTokensToday > 0 ? "success" : "muted"}
                    />
                    <Stat
                        label="Today's Lunch"
                        value={data?.lunch ? `৳${data.lunch.mealPrice}` : "Not set"}
                        tone={data?.lunch ? "success" : "muted"}
                    />
                    <Stat
                        label="Today's Dinner"
                        value={data?.dinner ? `৳${data.dinner.mealPrice}` : "Not set"}
                        tone={data?.dinner ? "success" : "muted"}
                    />
                </div>

                {data && (
                    <div className="grid md:grid-cols-2 gap-6">
                        <TodaysMeals lunch={data.lunch} dinner={data.dinner} />
                        <RecentPayments payments={data.recentPayments} />
                    </div>
                )}
            </div>
        </AppShell>
    );
}
