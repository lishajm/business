import axios from 'axios';

const BASE = process.env.REACT_APP_API_URL || 'https://business-proposal-quotation-generator-qurw.onrender.com/api';

const api = axios.create({ baseURL: BASE });

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('bpqg_token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

// AUTH
export const login = (data) => api.post('/auth/login', data);
export const logout = () => api.post('/auth/logout');
export const getMe = () => api.get('/auth/me');

// USERS
export const registerClient = (data) => api.post('/users/register/client', data);
export const registerUser = (data) => api.post('/users/register', data);
export const getAllUsers = () => api.get('/users/all');
export const getDevelopers = () => api.get('/users/developers');
export const toggleUser = (id) => api.patch(`/users/${id}/toggle`);
export const getLogs = () => api.get('/users/logs');
export const getPendingClients = () => api.get('/users/pending');
export const approveClient = (id) => api.put(`/users/${id}/approve`);
export const verifyOtp = (data) => api.post('/auth/verify-otp', data);

// PROPOSALS
export const createProposal = (data) => api.post('/proposals', data);
export const getMyProposals = () => api.get('/proposals/my');
export const getAllProposals = () => api.get('/proposals/all');
export const getAssignedProposals = () => api.get('/proposals/assigned');
export const getProposal = (id) => api.get(`/proposals/${id}`);
export const reviewProposal = (id, data) => api.patch(`/proposals/${id}/review`, data);

// QUOTATIONS
export const generateQuotations = (proposalId) => api.post(`/quotations/generate/${proposalId}`);
export const getQuotations = (proposalId) => api.get(`/quotations/proposal/${proposalId}`);
export const selectQuotation = (data) => api.post('/quotations/select', data);
export const updateQuotation = (id, data) => api.patch(`/quotations/${id}`, data);
export const getAllSelections = () => api.get('/quotations/selections/all');
export const getQuotationPdf = (quotationId) =>
  api.get(`/quotations/pdf/${quotationId}`, { responseType: 'blob' });

// MEETINGS
export const requestMeeting = (data) => api.post('/meetings', data);
export const getMyMeetings = () => api.get('/meetings/my');
export const getAllMeetings = () => api.get('/meetings/all');
export const updateMeeting = (id, data) => api.patch(`/meetings/${id}`, data);

// ASSIGNMENTS
export const assignDeveloper = (data) => api.post('/assignments', data);
export const updateAssignmentStatus = (proposalId, data) => api.patch(`/assignments/${proposalId}/status`, data);

// REPORTS
export const submitReport = (data) => api.post('/reports', data);
export const getMyReports = () => api.get('/reports/my');
export const getAllReports = () => api.get('/reports/all');
export const getDeveloperReports = (devId) => api.get(`/reports/developer/${devId}`);

export default api;
