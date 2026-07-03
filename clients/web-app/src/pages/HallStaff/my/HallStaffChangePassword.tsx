// HallStaff/my/HallStaffChangePassword.tsx
import { adminAuthAPI } from "@/services/api";
import { ChangePasswordPage } from "@/pages/shared/ChangePasswordPage";

export function HallStaffChangePassword() {
    return <ChangePasswordPage changePassword={adminAuthAPI.changePassword} />;
}