// SuperAdmin/my/SuperAdminChangePassword.tsx
import { adminAuthAPI } from "@/services/api";
import { ChangePasswordPage } from "@/pages/shared/ChangePasswordPage";

export function SuperAdminChangePassword() {
    return <ChangePasswordPage changePassword={adminAuthAPI.changePassword} />;
}