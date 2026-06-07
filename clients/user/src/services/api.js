import apiClient from "./apiClient";

// ── Student API ───────────────────────────────────────────────────────────────
export const studentAPI = {
    register:       (data)               => apiClient.post("/api/v1/students", data),
    getProfile:     ()                   => apiClient.get("/api/v1/students/me"),
    updateProfile:  (data)               => apiClient.put("/api/v1/students/me", data),
    changePassword: (oldPassword, newPassword) =>
        apiClient.post("/api/v1/students/change-password", { oldPassword, newPassword }),
    getById:  (id)          => apiClient.get(`/api/v1/students/${id}`),
    getAll:   (filters = {}) => apiClient.get("/api/v1/students", { params: filters }),
};

// ── Hall Admin API ────────────────────────────────────────────────────────────
export const hallAdminAPI = {
    getMyProfile:    ()       => apiClient.get("/api/v1/admins/me"),
    updateMyProfile: (data)   => apiClient.put("/api/v1/admins/me", data),
    createHallStaff: (data)   => apiClient.post("/api/v1/admins", data),
    getHallStaff:    (f = {}) => apiClient.get("/api/v1/admins", { params: f }),
    toggleHallStaffStatus: (id) => apiClient.patch(`/api/v1/admins/${id}/status`),
    getStudents:    (f = {}) => apiClient.get("/api/v1/students", { params: f }),
    suspendStudent: (id)     => apiClient.patch(`/api/v1/students/${id}/status`),
    createMealConfig: (payload)        => apiClient.post("/api/v1/meal-configs", payload),
    getMealConfigs:   (f = {})         => apiClient.get("/api/v1/meal-configs", { params: f }),
    updateMealConfig: (id, payload)    => apiClient.put(`/api/v1/meal-configs/${id}`, payload),
    getPayments:      (f = {})         => apiClient.get("/api/v1/payments", { params: f }),
    approvePayment:   (id)             => apiClient.patch(`/api/v1/payments/${id}/approve`),
    rejectPayment:    (id, reason)     => apiClient.patch(`/api/v1/payments/${id}/reject`, { rejectionReason: reason }),
    // aliases
    getProfile:      ()     => apiClient.get("/api/v1/admins/me"),
    updateProfile:   (data) => apiClient.put("/api/v1/admins/me", data),
    getById:         (id)   => apiClient.get(`/api/v1/admins/${id}`),
    updateHallStaffStatus: (id, status) =>
        apiClient.patch(`/api/v1/admins/${id}/status`, {
            reason: status === "SUSPENDED" ? "Suspended" : "Activated",
        }),
};

// ── Hall API ──────────────────────────────────────────────────────────────────
export const hallAPI = {
    createHall:      (data)   => apiClient.post("/api/v1/halls", data),
    getAll:          (f = {}) => apiClient.get("/api/v1/halls", { params: f }),
    getById:         (id)     => apiClient.get(`/api/v1/halls/${id}`),
    getByShortName:  (name)   => apiClient.get(`/api/v1/halls/short-name/${name}`),
    updateHall:      (id, d)  => apiClient.put(`/api/v1/halls/${id}`, d),
    updateHallStatus:(id)     => apiClient.patch(`/api/v1/halls/${id}/status`, { reason: 'Status update' }),
    suspendHall:     (id)     => apiClient.patch(`/api/v1/halls/${id}/status`, { reason: 'Suspended' }),
    activateHall:    (id)     => apiClient.patch(`/api/v1/halls/${id}/status`, { reason: 'Activated' }),
    getCount:        ()       => apiClient.get('/api/v1/halls/count'),
};

// ── Super Admin API ───────────────────────────────────────────────────────────
export const superAdminAPI = {
    ...hallAPI,
    getProfile:      ()       => apiClient.get("/api/v1/students/me"),
    getAllAdmins:     (f = {}) => apiClient.get("/api/v1/admins", { params: f }),
    getAdminsCount:  ()       => apiClient.get('/api/v1/admins/count'),
    getAdminById:    (id)     => apiClient.get(`/api/v1/admins/${id}`),
    getAllStudents:   (f = {}) => apiClient.get("/api/v1/students", { params: f }),
    suspendStudent:  (id)     => apiClient.patch(`/api/v1/students/${id}/status`, { status: "SUSPENDED" }),
    createAdmin:     (data)   => apiClient.post("/api/v1/admins", data),
    updateAdminStatus: (id, status) =>
        apiClient.patch(`/api/v1/admins/${id}/status`, {
            reason: status === "SUSPENDED" ? "Suspended" : "Activated",
        }),
    suspendAdmin: (id) => superAdminAPI.updateAdminStatus(id, "SUSPENDED"),
    activateAdmin: (id) => superAdminAPI.updateAdminStatus(id, "ACTIVE"),
};

// ── Hall Staff API ────────────────────────────────────────────────────────────
export const hallStaffAPI = {
    getMyProfile:    ()       => apiClient.get("/api/v1/admins/me"),
    updateMyProfile: (data)   => apiClient.put("/api/v1/admins/me", data),
    getStudents:     (f = {}) => apiClient.get("/api/v1/students", { params: f }),
    getMealConfigs:  (f = {}) => apiClient.get("/api/v1/meal-configs", { params: f }),
    createMealConfig:(payload)       => apiClient.post("/api/v1/meal-configs", payload),
    updateMealConfig:(id, payload)   => apiClient.put(`/api/v1/meal-configs/${id}`, payload),
    getPayments:     (f = {})        => apiClient.get("/api/v1/payments", { params: f }),
    approvePayment:  (id)            => apiClient.patch(`/api/v1/payments/${id}/approve`),
    rejectPayment:   (id, reason)    => apiClient.patch(`/api/v1/payments/${id}/reject`, { rejectionReason: reason }),
    scanQrToken:     (qrCodeData)    => apiClient.post("/api/v1/meal-tokens/staff-scan", { qrCodeData }),
    getProfile:      ()     => apiClient.get("/api/v1/admins/me"),
    updateProfile:   (data) => apiClient.put("/api/v1/admins/me", data),
    __hallSummaryEndpoint: null,
    getHallSummaries: function (params = {}) {
        const self = this;
        const try_ = (ep) => apiClient.get(ep, { params });
        if (self.__hallSummaryEndpoint) return try_(self.__hallSummaryEndpoint);
        return try_('/api/v1/summary/hall')
            .then((r) => { self.__hallSummaryEndpoint = '/api/v1/summary/hall'; return r; })
            .catch((e) => {
                if (e.response?.status === 404)
                    return try_('/api/v1/summary')
                        .then((r) => { self.__hallSummaryEndpoint = '/api/v1/summary'; return r; });
                throw e;
            });
    },
};

// ── Meal Token API (student) ──────────────────────────────────────────────────
export const mealTokenAPI = {
    getMyTokens:   () => apiClient.get("/api/v1/meal-tokens/my"),
    getTokenById:  (id) => apiClient.get(`/api/v1/meal-tokens/${id}`),
};

// ── Manual Payment API (CASH path — kept for backward compatibility) ──────────
export const paymentAPI = {
    getMyPayments:  () => apiClient.get("/api/v1/payments/my"),
    getPayments:    (f = {}) => apiClient.get("/api/v1/payments", { params: f }),
    getPaymentById: (id) => apiClient.get(`/api/v1/payments/${id}`),
    approvePayment: (id) => apiClient.patch(`/api/v1/payments/${id}/approve`),
    rejectPayment:  (id, reason) =>
        apiClient.patch(`/api/v1/payments/${id}/reject`, { rejectionReason: reason }),
};

// ── bKash Gateway API ─────────────────────────────────────────────────────────
// Flow:
//   1. createPayment()  → POST /api/payment/bkash/create
//                         returns { paymentID, bkashURL }
//                         React does: window.location.assign(bkashURL)
//
//   2. bKash calls backend GET /api/payment/bkash/callback?paymentID=xxx&status=success
//      Backend runs executePayment() internally — React never calls execute.
//      Backend redirects browser to:
//        /payment/success?paymentID=xxx&trxID=yyy&status=COMPLETED  (success)
//        /payment/failure?message=xxx&paymentID=xxx                 (failure/cancel)
//
//   3. cancelPayment()  → POST /api/payment/bkash/cancel
//                         Called by PaymentFailurePage to clean up INITIATED record
//                         so the student can start a new payment.
//
//   4. refundPayment()  → POST /api/payment/bkash/refund  (admin panel only)
//
//   5. getHistory()     → GET /api/v1/payments/my
//                         Returns all payments for the logged-in student.
export const bkashPaymentAPI = {
    createPayment: (payload) =>
        apiClient.post('/api/payment/bkash/create', payload),

    // executePayment is NOT called by React.
    // bKash calls the backend callback URL and the backend runs execute internally.

    cancelPayment: (payload) =>
        apiClient.post('/api/payment/bkash/cancel', payload),

    refundPayment: (payload) =>
        apiClient.post('/api/payment/bkash/refund', payload),

    getHistory: () =>
        apiClient.get('/api/v1/payments/my'),
};
