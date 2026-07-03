// HallAdmin/my/HallAdminProfile.tsx
import { hallAdminAPI } from "@/services/api";
import { ProfilePage } from "@/pages/shared/ProfilePage";

export function HallAdminProfile() {
    return <ProfilePage api={hallAdminAPI} isStudent={false} />;
}