import { hallStaffAPI } from "@/services/api";
import { PaymentsQueuePage } from "@/pages/shared/PaymentsQueuePage";

export function HallStaffPayments() {
    return <PaymentsQueuePage api={hallStaffAPI} title="Payment Queue" subtitle="All bKash transactions for your hall." />;
}