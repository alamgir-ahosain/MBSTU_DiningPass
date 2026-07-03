// HallAdmin/my/HallAdminChangePassword.tsx
import { adminAuthAPI } from "@/services/api";
import { ChangePasswordPage } from "@/pages/shared/ChangePasswordPage";

export function HallAdminChangePassword() {
    return <ChangePasswordPage changePassword={adminAuthAPI.changePassword} />;
}