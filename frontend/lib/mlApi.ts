import axios from 'axios';

const ML_URL = process.env.NEXT_PUBLIC_ML_URL || 'http://localhost:8000';

const mlApi = axios.create({ baseURL: ML_URL });

export const predictCGPA = (data: any) => mlApi.post('/ml/predict/cgpa', data);
export const predictBacklog = (data: any) => mlApi.post('/ml/predict/backlog', data);
export const predictPlacement = (data: any) => mlApi.post('/ml/predict/placement', data);
export const detectPatterns = (data: any) => mlApi.post('/ml/patterns/detect', data);
export const simulateWhatIf = (data: any) => mlApi.post('/ml/whatif/simulate', data);

export default mlApi;
