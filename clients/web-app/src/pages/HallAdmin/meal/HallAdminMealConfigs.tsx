// HallAdmin/meal/HallAdminMealConfigs.tsx
import { hallAdminAPI } from "@/services/api";
import { MealConfigsPage } from "@/pages/shared/MealConfigsPage";

export function HallAdminMealConfigs() {
    return <MealConfigsPage api={hallAdminAPI} />;
}