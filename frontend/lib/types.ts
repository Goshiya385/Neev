// ============ USER TYPES ============
export interface Student {
  _id: string;
  rollNumber: string;
  name: string;
  email: string;
  phone: string;
  branch: string;
  semester: number;
  college: string;
  careerGoal: string;
  cgpa: number;
  backlogs: number;
  placementReadiness: number;
  profileComplete: boolean;
  techProfile: {
    languages: string[];
    frameworks: string[];
    tools: string[];
    githubUrl: string;
    linkedinUrl: string;
  };
  softSkills: {
    englishFluency: number;
    communicationConfidence: number;
    aptitudeLevel: number;
    interviewConfidence: number;
  };
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string;
  isTC: boolean;
  createdAt: string;
}

export interface Teacher {
  _id: string;
  email: string;
  name: string;
  department: string;
  assignedStudents: string[];
  role: 'teacher' | 'admin';
}

// ============ ACADEMIC TYPES ============
export interface Marks {
  _id: string;
  studentId: string;
  semester: number;
  subject: string;
  subjectCode: string;
  internalMarks: number;
  practicalMarks: number;
  externalMarks: number;
  maxInternal: number;
  maxPractical: number;
  maxExternal: number;
  examType: string;
  examDate: string;
}

export interface AttendanceRecord {
  _id: string;
  subject: string;
  date: string;
  status: 'present' | 'absent' | 'late';
  semester: number;
}

export interface AttendanceSummary {
  total: number;
  present: number;
  late: number;
  absent: number;
  percentage: number;
}

// ============ SKILL TYPES ============
export interface SkillProgress {
  _id: string;
  category: string;
  skillName: string;
  completionPercent: number;
  confidenceLevel: number;
  streak: number;
  lastUpdated: string;
}

// ============ PROJECT TYPES ============
export interface Project {
  _id: string;
  title: string;
  description: string;
  techStack: string[];
  githubUrl: string;
  liveUrl: string;
  semester: number;
  status: 'idea' | 'in-progress' | 'completed';
  aiResumePoints: string[];
}

// ============ ROADMAP TYPES ============
export interface Milestone {
  _id: string;
  title: string;
  category: string;
  expected: boolean;
  completed: boolean;
  completedAt: string;
  dueWeek: number;
}

export interface RoadmapProgress {
  _id: string;
  semester: number;
  milestones: Milestone[];
  overallProgress: number;
}

// ============ PLANNER TYPES ============
export interface MicroTask {
  _id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  _id: string;
  title: string;
  category: string;
  microTasks: MicroTask[];
  completed: boolean;
  dueDate: string;
}

export interface WeeklyTask {
  _id: string;
  weekNumber: number;
  year: number;
  tasks: Task[];
}

// ============ PLACEMENT TYPES ============
export interface PlacementBreakdown {
  dsaSkills: number;
  projects: number;
  communication: number;
  aptitude: number;
  cgpa: number;
  github: number;
  mockTests: number;
  total: number;
}

export interface MockTest {
  _id: string;
  testType: string;
  subject: string;
  score: number;
  maxScore: number;
  timeTaken: number;
  weakTopics: string[];
  accuracy: number;
}

// ============ NOTIFICATION TYPES ============
export interface Notification {
  _id: string;
  message: string;
  type: 'warning' | 'reminder' | 'achievement' | 'alert' | 'info';
  read: boolean;
  createdAt: string;
}

// ============ INSIGHT TYPES ============
export interface Insight {
  type: string;
  icon: string;
  message: string;
  color: string;
}

// ============ DASHBOARD TYPES ============
export interface DashboardData {
  student: Student;
  cgpaTrend: { semester: number; sgpa: number }[];
  insights: Insight[];
  placementBreakdown: PlacementBreakdown;
  notifications: Notification[];
  streaks: { current: number; longest: number };
}

// ============ PATTERN TYPES ============
export interface Pattern {
  type: string;
  subject?: string;
  message: string;
  risk: string;
  recommendation?: string;
  percentage?: number;
}

// ============ AUTH TYPES ============
export interface AuthResponse {
  token: string;
  user: Student | Teacher;
  role: 'student' | 'teacher' | 'admin';
  profileComplete?: boolean;
}

// ============ CHAT TYPES ============
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}
