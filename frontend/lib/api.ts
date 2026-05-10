import axios from 'axios';
import { getToken, clearAuth } from './auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) { clearAuth(); if (typeof window !== 'undefined') window.location.href = '/login'; }
    return Promise.reject(err);
  }
);

// Auth
export const loginStudent = (rollNumber: string, password: string) => api.post('/api/auth/student/login', { rollNumber, password });
export const loginTeacher = (email: string, password: string) => api.post('/api/auth/teacher/login', { email, password });
export const registerStudent = (data: any) => api.post('/api/auth/student/register', data);
export const getMe = () => api.get('/api/auth/me');

// Student
export const getProfile = () => api.get('/api/students/profile');
export const updateProfile = (data: any) => api.put('/api/students/profile', data);
export const completeOnboarding = (data: any) => api.post('/api/students/onboarding', data);
export const getDashboard = () => api.get('/api/students/dashboard');
export const getNotifications = () => api.get('/api/students/notifications');
export const markNotificationRead = (id: string) => api.put(`/api/students/notifications/${id}/read`);

// Academics
export const addMarks = (data: any) => api.post('/api/academics/marks', data);
export const getMarks = () => api.get('/api/academics/marks');
export const getMarksBySemester = (sem: number) => api.get(`/api/academics/marks/semester/${sem}`);
export const addAttendance = (data: any) => api.post('/api/academics/attendance', data);
export const getAttendance = () => api.get('/api/academics/attendance');
export const getAcademicAnalytics = () => api.get('/api/academics/analytics');
export const getPatterns = () => api.get('/api/academics/patterns');

// Skills
export const getSkills = () => api.get('/api/skills');
export const updateSkill = (id: string, data: any) => api.put(`/api/skills/${id}`, data);
export const logSkill = (data: any) => api.post('/api/skills/log', data);
export const getSkillsSummary = () => api.get('/api/skills/summary');

// Roadmap
export const getRoadmap = () => api.get('/api/roadmap');
export const getRoadmapProgress = () => api.get('/api/roadmap/progress');
export const completeMilestone = (id: string) => api.put(`/api/roadmap/milestone/${id}`);
export const regenerateRoadmap = () => api.post('/api/roadmap/regenerate');

// Projects
export const getProjects = () => api.get('/api/projects');
export const addProject = (data: any) => api.post('/api/projects', data);
export const updateProject = (id: string, data: any) => api.put(`/api/projects/${id}`, data);
export const deleteProject = (id: string) => api.delete(`/api/projects/${id}`);
export const generateResumePoints = (id: string) => api.post(`/api/projects/${id}/ai-resume-points`);

// Planner
export const getCurrentWeek = () => api.get('/api/planner/current-week');
export const addTask = (data: any) => api.post('/api/planner/task', data);
export const completeTask = (id: string, data?: any) => api.put(`/api/planner/task/${id}/complete`, data);
export const getStreak = () => api.get('/api/planner/streak');
export const getHeatmap = () => api.get('/api/planner/heatmap');

// Placement
export const getPlacementScore = () => api.get('/api/placement/score');
export const getCompanyPack = (company: string) => api.get(`/api/placement/company/${company}`);
export const getInterviewMeter = () => api.get('/api/placement/interview-meter');
export const saveMockTest = (data: any) => api.post('/api/placement/mock-test', data);
export const getMockHistory = () => api.get('/api/placement/mock-history');

// Saarthi
export const chatWithSaarthi = (message: string, history: any[]) => api.post('/api/saarthi/chat', { message, history });
export const getQuickInsight = () => api.post('/api/saarthi/quick-insight');
export const getWeeklyBriefing = () => api.post('/api/saarthi/weekly-briefing');

// Reports
export const getSemesterReport = (sem: number) => api.get(`/api/reports/semester/${sem}`);
export const getWrappedReport = () => api.get('/api/reports/wrapped');

// Teacher
export const getTeacherDashboard = () => api.get('/api/teacher/dashboard');
export const getTeacherStudents = (params?: any) => api.get('/api/teacher/students', { params });
export const getStudentDetail = (id: string) => api.get(`/api/teacher/students/${id}`);
export const markStudentTC = (id: string) => api.put(`/api/teacher/students/${id}/tc`);
export const notifyStudent = (id: string, data: any) => api.post(`/api/teacher/students/${id}/notify`, data);
export const getRiskAlerts = () => api.get('/api/teacher/risk-alerts');

// ML Predictions (proxied through backend or direct to ML service)
const ML_URL = process.env.NEXT_PUBLIC_ML_URL || 'http://localhost:8000';
const ml = axios.create({ baseURL: ML_URL });

export const predictCGPA = (data: any) => ml.post('/ml/predict/cgpa', { data });
export const predictBacklog = (data: any) => ml.post('/ml/predict/backlog', { data });
export const predictSkillGap = (data: any) => ml.post('/ml/predict/skills', { data });
export const predictPlacement = (data: any) => ml.post('/ml/predict/placement', { data });
export const predictRoadmap = (data: any) => ml.post('/ml/predict/roadmap', { data });
export const predictWeeklyPlan = (data: any) => ml.post('/ml/predict/weekly-plan', { data });
export const simulateWhatIf = (data: any) => ml.post('/ml/whatif/simulate', { data });
export const detectPatterns = (data: any) => ml.post('/ml/patterns/detect', { data });

// Interview AI
export const evaluateInterview = (data: any) => ml.post('/ml/interview/evaluate', data);
export const getInterviewQuestions = (company: string, count?: number) => ml.get(`/ml/interview/questions/${company}`, { params: { count } });
export const getInterviewCompanies = () => ml.get('/ml/interview/companies');

// Trends & Resources
export const getTrendingSkills = (data: any) => ml.post('/ml/trends/skills', data);
export const getSkillResources = (skill: string) => ml.get(`/ml/trends/resources/${skill}`);
export const getAIRecommendations = (data: any) => ml.post('/ml/trends/ai-recommend', data);

// Check-in
export const submitCheckin = (data: any) => api.post('/api/checkin/daily', data);
export const getTodayCheckin = () => api.get('/api/checkin/today');
export const getCheckinHistory = (days?: number) => api.get('/api/checkin/history', { params: { days } });
export const getCheckinStats = () => api.get('/api/checkin/stats');
export const getCheckinPrompt = () => api.get('/api/checkin/prompt');

// Feedback
export const submitFeedback = (data: any) => api.post('/api/feedback', data);
export const getMyFeedback = () => api.get('/api/feedback/my');

export default api;
