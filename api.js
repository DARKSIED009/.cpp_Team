import axios from 'axios';

const BASE_URL = 'http://localhost:8000';

const api = axios.create({
    baseURL: BASE_URL,
    timeout: 30000,
});

export const getWorkers = () => api.get('/workers').then(r => r.data);
export const getWorker = (id) => api.get(`/worker/${id}`).then(r => r.data);
export const calculateScore = (workerData) => api.post('/score/calculate', workerData).then(r => r.data);
export const simulateScore = (simRequest) => api.post('/score/simulate', simRequest).then(r => r.data);

// AI Endpoints
export const getAIExplanation = (workerData) => api.post('/ai/explain-score', { worker_data: workerData }).then(r => r.data);
export const getAICritique = (workerData) => api.post('/ai/critique', { worker_data: workerData }).then(r => r.data);
export const getAILenderSummary = (workerData) => api.post('/ai/lender-summary', { worker_data: workerData }).then(r => r.data);
export const getAISimulateAdvice = (oldScore, newScore, adjustments) => api.post('/ai/simulate-advice', { old_score: oldScore, new_score: newScore, adjustments }).then(r => r.data);
export const sendAIChatMessage = (workerData, history, message) => api.post('/ai/chat', { worker_data: workerData, history, message }).then(r => r.data);

// New V2 Features
export const getAICoachPlan = (workerData) => api.post('/ai/coach', { worker_data: workerData }).then(r => r.data);
export const getAIAnomalyReport = (workerData) => api.post('/ai/anomaly', { worker_data: workerData }).then(r => r.data);
export const getAILenderNarrative = (workerData) => api.post('/ai/narrative', { worker_data: workerData }).then(r => r.data);

export default api;
