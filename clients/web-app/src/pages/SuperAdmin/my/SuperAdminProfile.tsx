// SuperAdmin/my/SuperAdminProfile.tsx
import { superAdminAPI } from "@/services/api";
import { ProfilePage } from "@/pages/shared/ProfilePage";

export function SuperAdminProfile() {
    return <ProfilePage api={superAdminAPI} isStudent={false} />;
}