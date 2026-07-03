import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import type { MealConfig } from "@/types";

export function TodaysMeals({ lunch, dinner }: { lunch?: MealConfig; dinner?: MealConfig }) {
  const { role } = useAuth();
  const meals = [lunch, dinner].filter(Boolean) as MealConfig[];
  const manageHref = role === "HALL_STAFF" ? "/hallStaff/meals" : "/hallAdmin/meals";

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg">Today's meals</h3>
        <Link to={manageHref} className="text-sm text-primary hover:underline">
          Manage
        </Link>
      </div>
      <div className="space-y-3">
        {meals.map((m) => (
          <div
            key={m.id}
            className="flex items-start justify-between border-b border-border pb-3 last:border-0 last:pb-0"
          >
            <div>
              <div className="font-medium">{m.mealType}</div>
              <div className="text-sm text-muted-foreground">{m.mealMenu}</div>
            </div>
            <div className="text-right">
              <div className="font-display text-lg">৳{m.mealPrice}</div>
              <div className="text-xs text-muted-foreground">cut by {m.cutTokenBefore}</div>
            </div>
          </div>
        ))}
        {meals.length === 0 && (
          <div className="text-sm text-muted-foreground">No meals configured for today.</div>
        )}
      </div>
    </div>
  );
}