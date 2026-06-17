export type Role = "STUDENT" | "HALL_STAFF" | "HALL_ADMIN" | "SUPER_ADMIN";
export type MealType = "LUNCH" | "DINNER";
export type TokenStatus = "APPROVED" | "USED" | "CANCELLED";
export type PaymentStatus = "COMPLETED" | "FAILED" | "REFUNDED" | "PENDING";

export interface Hall {
  id: string;
  fullName: string;
  shortName: string;
  genderType: "MALE" | "FEMALE";
  bkashNumber: string;
  nagadNumber?: string;
  hallAdminId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface Admin {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: "HALL_ADMIN" | "HALL_STAFF" | "SUPER_ADMIN";
  hallShortName: string;
  isActive: boolean;
  createdAt: string;
}

export interface StudentProfile {
  id: string;
  studentId: string;
  fullName: string;
  email: string;
  hallShortName: string;
  department: string;
  gender: "MALE" | "FEMALE";
  roomNumber?: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
}

export interface MealConfig {
  id: string;
  hallShortName: string;
  mealDate: string;
  mealType: MealType;
  mealMenu: string;
  mealPrice: number;
  cutTokenBefore: string;
  tokenExpires: string;
  isActive: boolean;
  feastNote?: string;
  createdByName?: string;
  createdAt?: string;
  updatedByName?: string;
  updatedAt?: string;
  // Backend-provided aggregates (avoids fetching all tokens client side)
  tokensSold?: number;
  tokensUsed?: number;
  tokensPending?: number;
}

export interface MealToken {
  id: string;
  studentId: string;
  mealConfigId: string;
  mealDate: string;
  mealType: MealType;
  mealMenu: string;
  mealPrice: number;
  tokenStatus: TokenStatus;
  qrCodeData: string;
  qrGeneratedAt: string;
  usedAt?: string;
  scanMode?: "STAFF_SCANNED" | "STUDENT_SCANNED";
  expiresAt?: string;
}

export interface Payment {
  id: string;
  studentId: string;
  studentName?: string;
  mealDate: string;
  mealTypes: MealType[];
  totalAmount: number;
  paymentMethod: "BKASH";
  bkashTrxId: string;
  customerMsisdn: string;
  merchantInvoiceNo: string;
  paymentStatus: PaymentStatus;
  createdAt: string;
}

export interface SummaryRow {
  mealDate: string;
  mealType: MealType;
  mealMenu: string;
  mealPrice: number;
  feastNote?: string;
  sold: number;
  used: number;
  unused: number;
  revenue: number;
  isFinalized: boolean;
}