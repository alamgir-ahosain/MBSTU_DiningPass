// Student/my/ChangePassword.tsx
import { studentAPI } from "@/services/api";
import { ChangePasswordPage } from "@/pages/shared/ChangePasswordPage";

export function ChangePassword() {
    return <ChangePasswordPage changePassword={studentAPI.changePassword} />;
}