// Student/profile/StudentProfile.tsx
import { studentAPI } from "@/services/api";
import { ProfilePage } from "@/pages/shared/ProfilePage";

export function StudentProfile() {
    return <ProfilePage api={studentAPI} isStudent={true} />;
}


