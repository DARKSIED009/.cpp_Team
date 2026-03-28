import axios from 'axios';

// Inside your api.js
const API_BASE_URL = "/api";

const api = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
});

export const getWorkers = () => api.get('/workers').then(r => r.data);
export const getWorker = (id) => api.get(`/worker/${id}`).then(r => r.data);
export const calculateScore = (workerData) => api.post('/score/calculate', workerData).then(r => r.data);
export const simulateScore = (simRequest) => api.post('/score/simulate', simRequest).then(r => r.data);

export default api;
