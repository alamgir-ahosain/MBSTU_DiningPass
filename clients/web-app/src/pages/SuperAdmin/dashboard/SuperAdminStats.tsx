import { Building2, ShieldCheck, UserCog, Users } from "lucide-react";
import { Stat } from "@/components/Stat";

export function SuperAdminStats({
  totalHalls,
  allHalls,
  hallAdmins,
  hallStaff,
  students,
}: {
  totalHalls: number;
  allHalls: number;
  hallAdmins: number;
  hallStaff: number;
  students: number;
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <Stat label="Active Halls" value={`${totalHalls}/${allHalls}`} icon={Building2} />
      <Stat label="Hall Admins" value={hallAdmins} icon={ShieldCheck} />
      <Stat label="Hall Staff" value={hallStaff} icon={UserCog} />
      <Stat label="Students" value={students} icon={Users} />
    </div>
  );
}