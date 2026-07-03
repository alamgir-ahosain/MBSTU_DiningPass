// HallStaff/my/HallStaffProfile.tsx
import { hallStaffAPI } from "@/services/api";
import { ProfilePage } from "@/pages/shared/ProfilePage";

export function HallStaffProfile() {
    return <ProfilePage api={hallStaffAPI} isStudent={false} />;
}