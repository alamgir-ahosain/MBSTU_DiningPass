// HallAdmin/payment/HallAdminPayments.tsx
import { hallAdminAPI } from "@/services/api";
import { PaymentsQueuePage } from "@/pages/shared/PaymentsQueuePage";

export function HallAdminPayments() {
    return <PaymentsQueuePage api={hallAdminAPI} title="Payment Queue" subtitle="All bKash transactions for your hall." />;
}