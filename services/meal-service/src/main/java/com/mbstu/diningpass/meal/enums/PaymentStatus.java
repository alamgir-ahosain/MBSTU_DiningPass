package com.mbstu.diningpass.meal.enums;

public enum PaymentStatus {
//    SUBMITTED,
//    VERIFIED,
//    REJECTED,

    // For Bkash Gateway Path
    INITIATED,   // Payment record created, student redirected to bKash
    COMPLETED,   // bKash Execute confirmed — tokens auto-created
    FAILED,      // bKash returned non-Completed or execute failed
    REFUNDED     // Admin triggered bKash refund
}


