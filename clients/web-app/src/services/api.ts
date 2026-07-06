import apiClient from "./apiClient";


// ── Generic admin change-password (Hall Admin / Hall Staff / Super Admin) ──
export const adminAuthAPI = {
  changePassword: (oldPassword: string, newPassword: string) =>
    apiClient.post("/api/v1/admins/change-password", { oldPassword, newPassword }),
};


// ── Student ───────────────────────────────────────────────────────────────────
export const studentAPI = {
  register: (data: unknown) => apiClient.post("/api/v1/students", data),
  getProfile: () => apiClient.get("/api/v1/students/me"),
  updateProfile: (data: unknown) => apiClient.put("/api/v1/students/me", data),
  changePassword: (oldPassword: string, newPassword: string) =>
    apiClient.post("/api/v1/students/change-password", { oldPassword, newPassword }),
  getById: (id: string) => apiClient.get(`/api/v1/students/${id}`),
  getAll: (filters: object = {}) => apiClient.get("/api/v1/students", { params: filters }),

  getAvailableMealConfigs: (hallShortName: string) => apiClient.get("/api/v1/meal-configs", { params: { hallShortName, isActive: true } }),
};

// ── Hall Admin ────────────────────────────────────────────────────────────────
export const hallAdminAPI = {
  getMyProfile: () => apiClient.get("/api/v1/admins/me"),
  updateMyProfile: (data: unknown) => apiClient.put("/api/v1/admins/me", data),
  getProfile: () => apiClient.get("/api/v1/admins/me"),
  updateProfile: (data: unknown) => apiClient.put("/api/v1/admins/me", data),
  getById: (id: string) => apiClient.get(`/api/v1/admins/${id}`),
  createHallStaff: (data: unknown) => apiClient.post("/api/v1/admins", data),
  getHallStaff: (f: object = {}) => apiClient.get("/api/v1/admins", { params: f }),
  toggleHallStaffStatus: (id: string) => apiClient.patch(`/api/v1/admins/${id}/status`),
  updateHallStaffStatus: (id: string, status: string) =>
    apiClient.patch(`/api/v1/admins/${id}/status`, {
      reason: status === "SUSPENDED" ? "Suspended" : "Activated",
    }),
  getStudents: (f: object = {}) => apiClient.get("/api/v1/students", { params: f }),
  suspendStudent: (id: string) => apiClient.patch(`/api/v1/students/${id}/status`),
  createMealConfig: (payload: unknown) => apiClient.post("/api/v1/meal-configs", payload),
  getMealConfigs: (f: object = {}) => apiClient.get("/api/v1/meal-configs", { params: f }),
  updateMealConfig: (id: string, payload: unknown) => apiClient.put(`/api/v1/meal-configs/${id}`, payload),
  getPayments: (f: object = {}) => apiClient.get("/api/v1/payments", { params: f }),
  approvePayment: (id: string) => apiClient.patch(`/api/v1/payments/${id}/approve`),
  rejectPayment: (id: string, reason: string) =>
    apiClient.patch(`/api/v1/payments/${id}/reject`, { rejectionReason: reason }),
};

// ── Hall ──────────────────────────────────────────────────────────────────────
export const hallAPI = {
  createHall: (data: unknown) => apiClient.post("/api/v1/halls", data),
  getAll: (f: object = {}) => apiClient.get("/api/v1/halls", { params: f }),
  getById: (id: string) => apiClient.get(`/api/v1/halls/${id}`),
  getByShortName: (name: string) => apiClient.get(`/api/v1/halls/short-name/${name}`),
  updateHall: (id: string, d: unknown) => apiClient.put(`/api/v1/halls/${id}`, d),
  updateHallStatus: (id: string) => apiClient.patch(`/api/v1/halls/${id}/status`, { reason: "Status update" }),
  suspendHall: (id: string) => apiClient.patch(`/api/v1/halls/${id}/status`, { reason: "Suspended" }),
  activateHall: (id: string) => apiClient.patch(`/api/v1/halls/${id}/status`, { reason: "Activated" }),
  getCount: () => apiClient.get("/api/v1/halls/count"),
};

// ── Super Admin ───────────────────────────────────────────────────────────────
export const superAdminAPI = {
  ...hallAPI,
  getProfile: () => apiClient.get("/api/v1/students/me"),
  updateProfile: (data: unknown) => apiClient.put("/api/v1/students/me", data),
  getAllAdmins: (f: object = {}) => apiClient.get("/api/v1/admins", { params: f }),
  getAdminsCount: () => apiClient.get("/api/v1/admins/count"),
  getAdminById: (id: string) => apiClient.get(`/api/v1/admins/${id}`),
  getAllStudents: (f: object = {}) => apiClient.get("/api/v1/students", { params: f }),
  suspendStudent: (id: string) => apiClient.patch(`/api/v1/students/${id}/status`, { status: "SUSPENDED" }),
  createAdmin: (data: unknown) => apiClient.post("/api/v1/admins", data),
  updateAdminStatus: (id: string, status: string) =>
    apiClient.patch(`/api/v1/admins/${id}/status`, {
      reason: status === "SUSPENDED" ? "Suspended" : "Activated",
    }),
  suspendAdmin: (id: string) => superAdminAPI.updateAdminStatus(id, "SUSPENDED"),
  activateAdmin: (id: string) => superAdminAPI.updateAdminStatus(id, "ACTIVE"),
};

// ── Hall Staff ────────────────────────────────────────────────────────────────
let __hallSummaryEndpoint: string | null = null;

export const hallStaffAPI = {
  getMyProfile: () => apiClient.get("/api/v1/admins/me"),
  updateMyProfile: (data: unknown) => apiClient.put("/api/v1/admins/me", data),
  getProfile: () => apiClient.get("/api/v1/admins/me"),
  updateProfile: (data: unknown) => apiClient.put("/api/v1/admins/me", data),
  getStudents: (f: object = {}) => apiClient.get("/api/v1/students", { params: f }),
  getMealConfigs: (f: object = {}) => apiClient.get("/api/v1/meal-configs", { params: f }),
  createMealConfig: (payload: unknown) => apiClient.post("/api/v1/meal-configs", payload),
  updateMealConfig: (id: string, payload: unknown) => apiClient.put(`/api/v1/meal-configs/${id}`, payload),
  getPayments: (f: object = {}) => apiClient.get("/api/v1/payments", { params: f }),
  approvePayment: (id: string) => apiClient.patch(`/api/v1/payments/${id}/approve`),
  rejectPayment: (id: string, reason: string) =>
    apiClient.patch(`/api/v1/payments/${id}/reject`, { rejectionReason: reason }),
  scanQrToken: (qrCodeData: string) =>
    apiClient.post("/api/v1/meal-tokens/staff-scan", { qrCodeData }),
  getHallSummaries: (page: number, pageSize: number, params: object = {}) => {
    const try_ = (ep: string) => apiClient.get(ep, { params });
    if (__hallSummaryEndpoint) return try_(__hallSummaryEndpoint);
    return try_("/api/v1/summary/hall")
      .then((r) => { __hallSummaryEndpoint = "/api/v1/summary/hall"; return r; })
      .catch((e) => {
        if (e.response?.status === 404)
          return try_("/api/v1/summary").then((r) => {
            __hallSummaryEndpoint = "/api/v1/summary";
            return r;
          });
        throw e;
      });
  },
};

// ── Meal Token ────────────────────────────────────────────────────────────────
export const mealTokenAPI = {
  getMyTokens: () => apiClient.get("/api/v1/meal-tokens/my"),
  getTokenById: (id: string) => apiClient.get(`/api/v1/meal-tokens/${id}`),
};

// ── Payment ───────────────────────────────────────────────────────────────────
export const paymentAPI = {
  // getMyPayments: () => apiClient.get("/api/v1/payments/my"),
  getPayments: (f: object = {}) => apiClient.get("/api/v1/payments", { params: f }),
  getPaymentById: (id: string) => apiClient.get(`/api/v1/payments/${id}`),
  approvePayment: (id: string) => apiClient.patch(`/api/v1/payments/${id}/approve`),
  rejectPayment: (id: string, reason: string) =>
    apiClient.patch(`/api/v1/payments/${id}/reject`, { rejectionReason: reason }),
};

// ── bKash ─────────────────────────────────────────────────────────────────────
export const bkashPaymentAPI = {
  createPayment: (payload: unknown) => apiClient.post("/api/payment/bkash/create", payload),
  cancelPayment: (payload: unknown) => apiClient.post("/api/payment/bkash/cancel", payload),
  refundPayment: (payload: unknown) => apiClient.post("/api/payment/bkash/refund", payload),
  getHistory: () => apiClient.get("/api/v1/payments/my"),
};