import axiosInstance, { cleanParams } from "./apiConfig";

const api = {
  user: {
    login: (data) => axiosInstance.post("/md/auth/login", data),
    logout: () => axiosInstance.post("/md/auth/logout"),
    get: () => axiosInstance.get("/md/user"),
    update: (userId, data) => axiosInstance.put(`/admin/users/${userId}`, data),
    store: (config) => axiosInstance.post("admin/users/", config),
    referrals: (user_id, params) =>
      axiosInstance.get(`/admin/users/clients/referrals/${user_id}`, { params }).then((res) => res.data),
  },
  chats: {
    get: (params) => axiosInstance.get("/admin/chats/all", { params: { ...params } }),
    getById: (id) => axiosInstance.get(`/admin/chats/${id}`),
    getMessages: (id) => axiosInstance.get(`/admin/chats/${id}/messages`),
    changeDoctor: ({ doctor_id, id }) => axiosInstance.put("/admin/chats/reassign", { doctor_id, id }),
    closeChat: (id) => axiosInstance.put(`/admin/chats/close/${id}`),
    closeWithoutRefund: (id) => axiosInstance.put(`/admin/chats/close/${id}?payMoney=false`),
    last10: (id) => axiosInstance.get(`/admin/chats/latest10/${id}`),
    sendMessage: (chatId, message, extra = {}) =>
      axiosInstance.post("/chat/send", { chat_id: chatId, content: message, ...extra }),
  },
  reviews: {
    get: (params) => axiosInstance.get("/admin/reviews/all", { params: { ...params } }),
    update: (data) => axiosInstance.put("/admin/reviews/update", data),
  },
  doctors: {
    get: (params) => axiosInstance.get("/admin/users/doctors", { params: { ...params } }).then((res) => res.data),
    getById: (id) => axiosInstance.get(`/admin/users/doctors/${id}`),
    getReviews: (id) => axiosInstance.get(`/admin/reviews/all/${id}`),
    getRequests: () => axiosInstance.get("/admin/users/doctors/requests"),
    update: (data) => axiosInstance.put(`/admin/users/doctors/update`, data),
    requestsCount: () => axiosInstance.get("/admin/users/doctors/requests-count"),
    removeRequest: (id) => axiosInstance.delete(`/admin/users/doctors/delete`, { data: { id } }),
    search: (keyword) => axiosInstance.get(`/admin/users/doctors/search/${keyword}`),
  },
  users: {
    get: (params) => axiosInstance.get("/admin/users/clients", { params: { ...params } }).then((res) => res.data),
    getById: (id) => axiosInstance.get(`/admin/users/clients/${id}`),
    getInfo: () => axiosInstance.get("/admin/users/clients-info"),
  },
  settings: {
    get: () => axiosInstance.get("/admin/settings/edit"),
    update: (data) => axiosInstance.put("/admin/settings/edit", data),
  },
  bootstrap: {
    simplifiedDoctors: () => axiosInstance.get("/admin/users/doctors/simplify"),
    categories: () => axiosInstance.get("/md/specialities"),
  },
  stats: {
    getStatistics: () => axiosInstance.get("/admin/statistics-extended?w").then((res) => res.data),
    getTransactions: (params) => axiosInstance.get("/admin/transactions", { params: { ...params } }).then(res => res.data),
    getTransactionsStats: () => axiosInstance.get("/admin/transactions-info").then(res => res.data),
    getUserTransactions: (userId, params) => axiosInstance.get(`/admin/transactions/${userId}`, { params: { ...params } }).then(res => res.data),
    getUserPayments: (userId, params) => axiosInstance.get(`/admin/payments/${userId}`, { params: { ...params } }).then(res => res.data),
    getUserTopups: (userId, params) => axiosInstance.get(`/admin/topups/${userId}`, { params: { ...params } }).then(res => res.data),
  },
  promocodes: {
    get: (params) => axiosInstance.get("/promocodes", { params: { ...params } }),
    create: (data) => axiosInstance.post("/promocodes", data),
    update: (data) => axiosInstance.put("/promocodes", data),
    delete: (id) => axiosInstance.delete(`/promocodes`, { data: { id } }),
  },
  medicalCentre: {
    get: (params) => axiosInstance.get("/admin/medical-centre", { params: { ...params } }),
    getById: (id) => axiosInstance.get(`/admin/medical-centre/${id}`),
    create: (data) => axiosInstance.post("/admin/medical-centre", data),
    update: (id, data) => axiosInstance.put(`/admin/medical-centre/${id}`, data),
    delete: (id) => axiosInstance.delete(`/admin/medical-centre/${id}`),
  },
  doctorMedicalCentre: {
    get: (id, params) => axiosInstance.get(`/admin/medical-centers/all/${id}`, { params: { user: id, ...params } }),
    create: (data) => axiosInstance.post("/admin/medical-centers/assign", data),
    delete: (userId, medicalCenterId) =>
      axiosInstance.delete(`admin/medical-centers/detach/${userId}/${medicalCenterId}`, {
        params: {
          user: userId,
          medical_center: medicalCenterId,
        },
      }),
  },
  support: {
    get: (params) => axiosInstance.get("/admin/chats/support", { params: { ...params } }),
    count: () => axiosInstance.get("/admin/chats/support/count"),
    sendGlobalMsg: (data) => axiosInstance.post("/chat/mass-mail", data),
    updateFlag: (chatId, flag) => axiosInstance.post("/admin/chats/update-flag", { chat_id: chatId, flag }),
  },
  logs: {
    get: (params) => axiosInstance.get("/admin/logs", { params: { ...params } }),
  },
  withdrawal: {
    count: () => axiosInstance.get("/admin/withdraw/count"),
    get: (params) => axiosInstance.get("/admin/withdraw/new", { params: { ...params } }),
    approve: (id) => axiosInstance.post(`/admin/withdraw/approve/${id}`),
    approved: (params) => axiosInstance.get("/admin/withdraw/approved", { params: { ...params } }),
  },
  wallet: {
    updateBalance: (data) => axiosInstance.post("/admin/wallet-management", data),
  },
  council: {
    get: (params) => axiosInstance.get("/admin/chats/consilium/all", { params: { ...params } }),
    count: () => axiosInstance.get("/admin/chats/consilium/count"),
    single: (id) => axiosInstance.get(`/admin/chats/consilium/${id}`),
    addMember: (data) => axiosInstance.put("/admin/chats/consilium/assign", data),
    close: (data) => axiosInstance.post("/admin/chats/consilium/close", data),
  },
  internal: {
    get: (params) => axiosInstance.get("/admin/chats/internal", { params: { ...params } }),
  },
  calls: {
    onhold: (params) => axiosInstance.get("/admin/calls/users", { params }).then((res) => res.data),
    active: (params) => axiosInstance.get("/admin/calls/my", { params }).then((res) => res.data),
    closed: (params) => axiosInstance.get("/admin/calls", { params }).then((res) => res.data),
    assign: (id) => axiosInstance.post(`/admin/calls/assign/${id}`),
    complete: (data) => axiosInstance.post(`/admin/calls/close`, data),
    sources: () =>
      axiosInstance
        .get("/admin/calls/sources")
        .then((res) => Object.entries(res.data).map(([value, label]) => ({ value, label }))),
  },
  companies: {
    list: (params) => axiosInstance.get("/admin/companies", { params }).then((res) => res.data),
    get: (id) => axiosInstance.get(`/admin/companies/${id}`).then((res) => res.data),
    create: (data) => axiosInstance.post("/admin/companies", data),
    update: (id, data) => axiosInstance.put(`/admin/companies/${id}`, data),
    delete: (id) => axiosInstance.delete(`/admin/companies/${id}`),
    employees: (id, params) =>
      axiosInstance.get(`/admin/companies/${id}/employees`, { params }).then((res) => res.data),
  },
  tipOfTheDay: {
    getAll: (params) => axiosInstance.get("/admin/totd", { params: cleanParams(params) }).then((res) => res.data),
    getById: (id) => axiosInstance.get(`/admin/totd/${id}`).then((res) => res.data),
    create: (data) => axiosInstance.post("/admin/totd", data),
    update: ({ id, data }) => {
      console.log(id, data);
      axiosInstance.put(`/admin/totd/${id}`, data);
    },
    delete: (id) => axiosInstance.delete(`/admin/totd/${id}`),
  },
  upload: {
    file: (file) => {
      const formData = new FormData();
      formData.append("file", file);

      return axiosInstance.post("/admin/admin-upload-file", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },
  },
};

export default api;
