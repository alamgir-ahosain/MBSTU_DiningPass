import apiClient from "./apiClient";

// Student API calls
export const studentAPI = {
  register: (studentData) => {
    return apiClient.post("/api/v1/students", studentData);
  },

  getProfile: () => {
    // Gets the current user's profile using /me endpoint
    // Backend extracts user ID from JWT custom claims
    return apiClient.get("/api/v1/students/me");
  },

  updateProfile: (studentData) => {
    // Updates the current user's profile using /me endpoint
    // Backend extracts user ID from JWT custom claims
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
  getProfile: (adminId) => {
    return apiClient.get(`/api/v1/admins/${adminId}`);
  },

  createHallStaff: (staffData) => {
    return apiClient.post("/api/v1/staff", staffData);
  },

  getHallStaff: (filters = {}) => {
    return apiClient.get("/api/v1/admins", { params: filters });
  },

  updateHallStaffStatus: (id, status) => {
    return apiClient.patch(`/api/v1/admins/${id}/status`, { status });
  },

  getById: (id) => {
    return apiClient.get(`/api/v1/admins/${id}`);
  },
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

  suspendHall: (id) => {
    return apiClient.patch(`/api/v1/halls/${id}/status`, {
      status: "SUSPENDED",
    });
  },
};

// Super Admin API calls (all the above, plus hall creation)
export const superAdminAPI = {
  ...hallAPI,
  createHall: (hallData) => {
    return apiClient.post("/api/v1/halls", hallData);
  },

  getAllAdmins: (filters = {}) => {
    return apiClient.get("/api/v1/admins", { params: filters });
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
    return apiClient.patch(`/api/v1/admins/${id}/status`, {
      status: "SUSPENDED",
    });
  },

  createAdmin: (adminData) => {
    return apiClient.post("/api/v1/admins", adminData);
  },
};

// Hall Staff API calls
export const hallStaffAPI = {
  getProfile: (staffId) => {
    return apiClient.get(`/api/v1/staff/${staffId}`);
  },

  getStudents: (filters = {}) => {
    return apiClient.get("/api/v1/students", { params: filters });
  },
};
