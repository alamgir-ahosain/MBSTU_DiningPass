import { ShieldCheck, Users, UtensilsCrossed } from "lucide-react";
import { Stat } from "@/components/Stat";
import type { MealConfig } from "@/types";

export function AdminStats({
  activeStaff,
  totalStaff,
  activeStudents,
  totalStudents,
  lunch,
  dinner,
}: {
  activeStaff: number;
  totalStaff: number;
  activeStudents: number;
  totalStudents: number;
  lunch?: MealConfig;
  dinner?: MealConfig;
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <Stat label="Active Staff" value={`${activeStaff}/${totalStaff}`} icon={ShieldCheck} />
      <Stat label="Active Students" value={`${activeStudents}/${totalStudents}`} icon={Users} />
      <Stat
        label="Today's Lunch"
        value={lunch ? "Open" : "—"}
        icon={UtensilsCrossed}
        tone={lunch ? "success" : "muted"}
      />
      <Stat
        label="Today's Dinner"
        value={dinner ? "Open" : "—"}
        icon={UtensilsCrossed}
        tone={dinner ? "success" : "muted"}
      />
    </div>
  );
}