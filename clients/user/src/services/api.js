import apiClient from "./apiClient";





// Student API calls
export const studentAPI = {
  register: (studentData) => {
    return apiClient.post("/api/v1/students", studentData);
  },

  getProfile: () => {
    // Gets the current user's profile using /me endpoint
    // Backend extracts user ID from firebase custom claims
    return apiClient.get("/api/v1/students/me");
  },

  updateProfile: (studentData) => {
    // Updates the current user's profile using /me endpoint
    // Backend extracts user ID from firebase custom claims
    return apiClient.put("/api/v1/students/me", studentData);
  },

  changePassword: (oldPassword, newPassword) => {
    return apiClient.post("/api/v1/students/change-password", {
      oldPassword,
      newPassword,
    });
  },

  getById: (id) => {
    return apiClient.get(`/api/v1/students/${id}`);
  },

  getAll: (filters = {}) => {
    return apiClient.get("/api/v1/students", { params: filters });
  },
};










// Hall Admin API calls
export const hallAdminAPI = {
  getMyProfile: () => {
    return apiClient.get("/api/v1/admins/me");
  },

  updateMyProfile: (adminData) => {
    return apiClient.put("/api/v1/admins/me", adminData);
  },

  createHallStaff: (staffData) => {
    return apiClient.post("/api/v1/admins", staffData);
  },

  getHallStaff: (filters = {}) => {
    return apiClient.get("/api/v1/admins", { params: filters });
  },

  toggleHallStaffStatus: (id) => {
    return apiClient.patch(`/api/v1/admins/${id}/status`);
  },

  getStudents: (filters = {}) => {
    return apiClient.get("/api/v1/students", { params: filters });
  },

  suspendStudent: (id) => {
    return apiClient.patch(`/api/v1/students/${id}/status`);
  },

  createMealConfig: (payload) => {
    return apiClient.post("/api/v1/meal-configs", payload);
  },

  getMealConfigs: (filters = {}) => {
    return apiClient.get("/api/v1/meal-configs", { params: filters });
  },

  updateMealConfig: (configId, payload) => {
    return apiClient.put(`/api/v1/meal-configs/${configId}`, payload);
  },

  getPayments: (filters = {}) => {
    return apiClient.get("/api/v1/payments", { params: filters });
  },

  approvePayment: (id) => {
    return apiClient.patch(`/api/v1/payments/${id}/approve`);
  },

  rejectPayment: (id, rejectionReason) => {
    return apiClient.patch(`/api/v1/payments/${id}/reject`, { rejectionReason });
  },

  // Backward-compatible aliases
  getProfile: () => apiClient.get("/api/v1/admins/me"),
  updateProfile: (adminData) => apiClient.put("/api/v1/admins/me", adminData),
  updateHallStaffStatus: (id, status) =>
    apiClient.patch(`/api/v1/admins/${id}/status`, {
      reason: status === "SUSPENDED" ? "Hall staff account suspended" : "Hall staff account activated",
    }),
  getById: (id) => apiClient.get(`/api/v1/admins/${id}`),

};







// Hall API calls
export const hallAPI = {
  createHall: (hallData) => {
    return apiClient.post("/api/v1/halls", hallData);
  },

  getAll: (filters = {}) => {
    return apiClient.get("/api/v1/halls", { params: filters });
  },

  getById: (id) => {
    return apiClient.get(`/api/v1/halls/${id}`);
  },

  getByShortName: (shortName) => {
    return apiClient.get(`/api/v1/halls/short-name/${shortName}`);
  },

  updateHall: (id, hallData) => {
    return apiClient.put(`/api/v1/halls/${id}`, hallData);
  },

  updateHallStatus: (id) => {
    return apiClient.patch(`/api/v1/halls/${id}/status`, { reason: 'Status update' });
  },

  suspendHall: (id) => {
    return apiClient.patch(`/api/v1/halls/${id}/status`, { reason: 'Hall suspended' });
  },

  activateHall: (id) => {
    return apiClient.patch(`/api/v1/halls/${id}/status`, { reason: 'Hall activated' });
  },
  getCount: () => {
    return apiClient.get('/api/v1/halls/count');
  },
};







// Super Admin API calls (all the above, plus hall creation)
export const superAdminAPI = {
  ...hallAPI,
  createHall: (hallData) => {
    return apiClient.post("/api/v1/halls", hallData);
  },
  getHallById: (id) => {
    return apiClient.get(`/api/v1/halls/${id}`);
  },
  getProfile: () => {
    return apiClient.get(`/api/v1/students/me`);
  },

  getAllAdmins: (filters = {}) => {
    return apiClient.get("/api/v1/admins", { params: filters });
  },

  getAdminsCount: () => {
    return apiClient.get('/api/v1/admins/count');
  },

  getAdminById: (id) => {
    return apiClient.get(`/api/v1/admins/${id}`);
  },

  getAllStudents: (filters = {}) => {
    return apiClient.get("/api/v1/students", { params: filters });
  },

  suspendStudent: (id) => {
    return apiClient.patch(`/api/v1/students/${id}/status`, {
      status: "SUSPENDED",
    });
  },

  suspendAdmin: (id) => {
    return superAdminAPI.updateAdminStatus(id, "SUSPENDED");
  },

  updateAdminStatus: (id, status) => {
    return apiClient.patch(`/api/v1/admins/${id}/status`, {
      reason: status === "SUSPENDED" ? "Hall admin suspended" : "Hall admin activated",
    });
  },

  activateAdmin: (id) => {
    return superAdminAPI.updateAdminStatus(id, "ACTIVE");
  },

  createAdmin: (adminData) => {
    return apiClient.post("/api/v1/admins", adminData);
  },
};






// Hall Staff API calls
export const hallStaffAPI = {
   getMyProfile: () => {
     return apiClient.get("/api/v1/admins/me");
   },

   updateMyProfile: (staffData) => {
     return apiClient.put("/api/v1/admins/me", staffData);
   },

   getStudents: (filters = {}) => {
     return apiClient.get("/api/v1/students", { params: filters });
   },

   getMealConfigs: (filters = {}) => {
     return apiClient.get("/api/v1/meal-configs", { params: filters });
   },

   createMealConfig: (payload) => {
     return apiClient.post("/api/v1/meal-configs", payload);
   },

   updateMealConfig: (configId, payload) => {
     return apiClient.put(`/api/v1/meal-configs/${configId}`, payload);
   },

   getPayments: (filters = {}) => {
     return apiClient.get("/api/v1/payments", { params: filters });
   },

   approvePayment: (id) => {
     return apiClient.patch(`/api/v1/payments/${id}/approve`);
   },

   rejectPayment: (id, rejectionReason) => {
     return apiClient.patch(`/api/v1/payments/${id}/reject`, { rejectionReason });
   },

   // QR Token Scanning
   scanQrToken: (qrCodeData) => {
     return apiClient.post("/api/v1/meal-tokens/staff-scan", { qrCodeData });
   },

    // Hall meal summaries
    // Resolve and cache the working endpoint to avoid repeated fallback calls
    __hallSummaryEndpoint: null,
    getHallSummaries: function (params = {}) {
      const self = this;
      const tryEndpoint = (ep) => apiClient.get(ep, { params });

      if (self.__hallSummaryEndpoint) {
        return tryEndpoint(self.__hallSummaryEndpoint);
      }

      // Try documented primary endpoint first
      return tryEndpoint('/api/v1/summary/hall')
        .then((res) => {
          self.__hallSummaryEndpoint = '/api/v1/summary/hall';
          return res;
        })
        .catch((err) => {
          if (err.response && err.response.status === 404) {
            // try fallback without /hall once
            return tryEndpoint('/api/v1/summary')
              .then((res) => {
                self.__hallSummaryEndpoint = '/api/v1/summary';
                return res;
              });
          }
          throw err;
        });
    },

   // Backward-compatible aliases
   getProfile: () => apiClient.get("/api/v1/admins/me"),
   updateProfile: (staffData) => apiClient.put("/api/v1/admins/me", staffData),
};


// Meal Token API calls (for students)
export const mealTokenAPI = {
  cutToken: (payload) => {
    return apiClient.post("/api/v1/meal-tokens", payload);
  },

  getMyTokens: () => {
    return apiClient.get("/api/v1/meal-tokens/my");
  },

  getTokenById: (id) => {
    return apiClient.get(`/api/v1/meal-tokens/${id}`);
  },
};

// Payment API calls (for students)
export const paymentAPI = {
  getMyPayments: () => {
    return apiClient.get("/api/v1/payments/my");
  },

  getPayments: (filters = {}) => {
    return apiClient.get("/api/v1/payments", { params: filters });
  },

  getPaymentById: (id) => {
    return apiClient.get(`/api/v1/payments/${id}`);
  },

  submitPayment: (payload) => {
    return apiClient.post("/api/v1/payments", payload);
  },

  approvePayment: (id) => {
    return apiClient.patch(`/api/v1/payments/${id}/approve`);
  },

  rejectPayment: (id, rejectionReason) => {
    return apiClient.patch(`/api/v1/payments/${id}/reject`, { rejectionReason });
  },
};