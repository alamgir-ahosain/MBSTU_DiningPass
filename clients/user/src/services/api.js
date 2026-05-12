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

  updateHallStatus: (id, status) => {
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
  getProfile: (staffId) => {
    return apiClient.get(`/api/v1/staff/me`);
  },

  updateProfile: (staffData) => {
    return apiClient().put(`/api/v1/staff/me`, staffData);
  },

  getStudents: (filters = {}) => {
    return apiClient.get("/api/v1/students", { params: filters });
  },
};
