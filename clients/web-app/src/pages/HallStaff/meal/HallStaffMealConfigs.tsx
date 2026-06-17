import { hallStaffAPI } from "@/services/api";
import { MealConfigsPage } from "@/pages/shared/MealConfigsPage";

export function HallStaffMealConfigs() {
    return <MealConfigsPage api={hallStaffAPI} />;
}