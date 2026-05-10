/**
 * Demo data for NEEV when running without MongoDB
 */

const demoStudent = {
  _id: 'demo_student_001',
  rollNumber: 'NEEV2024001',
  name: 'Arjun Sharma',
  email: 'arjun@neev.dev',
  branch: 'CS',
  semester: 4,
  college: 'NEEV Institute of Technology',
  careerGoal: 'Full Stack',
  cgpa: 7.8,
  techStack: ['JavaScript', 'React', 'Node.js', 'Python', 'MongoDB'],
  softSkills: { communication: 7, teamwork: 8, leadership: 6, problemSolving: 8 },
  streak: { current: 12, longest: 21 },
  profileComplete: true,
};

const demoMarks = [
  { subject: 'Data Structures', internal: 38, external: 52, total: 90, maxMarks: 100, semester: 3 },
  { subject: 'DBMS', internal: 35, external: 48, total: 83, maxMarks: 100, semester: 3 },
  { subject: 'Operating Systems', internal: 30, external: 42, total: 72, maxMarks: 100, semester: 3 },
  { subject: 'Computer Networks', internal: 32, external: 40, total: 72, maxMarks: 100, semester: 3 },
  { subject: 'Mathematics III', internal: 28, external: 35, total: 63, maxMarks: 100, semester: 3 },
  { subject: 'OOP with Java', internal: 36, external: 50, total: 86, maxMarks: 100, semester: 4 },
  { subject: 'Software Engineering', internal: 33, external: 45, total: 78, maxMarks: 100, semester: 4 },
  { subject: 'Algorithms', internal: 37, external: 51, total: 88, maxMarks: 100, semester: 4 },
  { subject: 'Web Technologies', internal: 40, external: 55, total: 95, maxMarks: 100, semester: 4 },
  { subject: 'Discrete Maths', internal: 29, external: 38, total: 67, maxMarks: 100, semester: 4 },
];

const demoSkills = [
  { name: 'JavaScript', category: 'language', progress: 85, confidence: 4, streak: 15 },
  { name: 'Python', category: 'language', progress: 70, confidence: 3, streak: 8 },
  { name: 'Java', category: 'language', progress: 60, confidence: 3, streak: 5 },
  { name: 'C++', category: 'language', progress: 55, confidence: 2, streak: 3 },
  { name: 'React', category: 'development', progress: 80, confidence: 4, streak: 12 },
  { name: 'Node.js', category: 'development', progress: 75, confidence: 3, streak: 10 },
  { name: 'MongoDB', category: 'development', progress: 65, confidence: 3, streak: 7 },
  { name: 'Express.js', category: 'development', progress: 70, confidence: 3, streak: 9 },
  { name: 'DSA', category: 'cs-core', progress: 60, confidence: 3, streak: 14 },
  { name: 'DBMS', category: 'cs-core', progress: 50, confidence: 2, streak: 4 },
  { name: 'OS Concepts', category: 'cs-core', progress: 45, confidence: 2, streak: 2 },
  { name: 'Git', category: 'tools', progress: 90, confidence: 5, streak: 20 },
  { name: 'VS Code', category: 'tools', progress: 95, confidence: 5, streak: 25 },
  { name: 'Docker', category: 'tools', progress: 30, confidence: 1, streak: 1 },
];

const demoProjects = [
  { _id: 'p1', title: 'E-Commerce Platform', description: 'Full-stack MERN e-commerce with payments', techStack: ['React', 'Node.js', 'MongoDB', 'Stripe'], githubLink: 'https://github.com/demo', resumeBullet: 'Built a full-stack e-commerce platform with payment integration serving 500+ users', status: 'completed' },
  { _id: 'p2', title: 'AI Chatbot', description: 'RAG-powered chatbot using LLMs', techStack: ['Python', 'FastAPI', 'ChromaDB', 'React'], githubLink: 'https://github.com/demo', resumeBullet: 'Developed an AI chatbot with RAG architecture reducing response latency by 40%', status: 'in-progress' },
  { _id: 'p3', title: 'Portfolio Website', description: 'Personal portfolio with animations', techStack: ['Next.js', 'Framer Motion', 'Tailwind'], githubLink: 'https://github.com/demo', resumeBullet: 'Designed a responsive portfolio achieving 95+ Lighthouse score', status: 'completed' },
];

const demoRoadmap = {
  semester: 4,
  overallProgress: 62,
  milestones: [
    { _id: 'm1', title: 'Complete DSA (Arrays + Strings)', category: 'technical', status: 'completed', dueWeek: 2, expected: 100, actual: 100 },
    { _id: 'm2', title: 'Build 2 MERN Projects', category: 'project', status: 'completed', dueWeek: 6, expected: 100, actual: 100 },
    { _id: 'm3', title: 'Learn System Design Basics', category: 'technical', status: 'in-progress', dueWeek: 10, expected: 70, actual: 45 },
    { _id: 'm4', title: 'Complete Aptitude Module', category: 'aptitude', status: 'in-progress', dueWeek: 12, expected: 60, actual: 30 },
    { _id: 'm5', title: 'GitHub: 50+ Contributions', category: 'github', status: 'in-progress', dueWeek: 14, expected: 50, actual: 35 },
    { _id: 'm6', title: 'English Communication Course', category: 'english', status: 'not-started', dueWeek: 16, expected: 0, actual: 0 },
  ]
};

const demoPlacement = {
  overallScore: 58,
  dimensions: {
    dsaSkills: 65,
    projects: 72,
    communication: 55,
    aptitude: 45,
    mockTests: 50,
  },
  companyPacks: ['TCS Digital', 'Infosys SP', 'Wipro Elite'],
};

const demoInsights = [
  { type: 'warning', message: '⚠️ Your OS Concepts score dropped 15% — time to revisit process scheduling bro 💀' },
  { type: 'success', message: '🔥 12-day streak! You\'re on fire. Keep that GitHub green!' },
  { type: 'info', message: '💡 Based on your Full Stack goal, you should learn Docker + CI/CD this semester' },
  { type: 'tip', message: '🎯 Your DSA is at 60% — aim for 80% before placement season hits' },
];

const demoDashboard = {
  student: demoStudent,
  marks: demoMarks,
  sgpaHistory: [
    { semester: 1, sgpa: 7.2 },
    { semester: 2, sgpa: 7.5 },
    { semester: 3, sgpa: 7.8 },
    { semester: 4, sgpa: 8.1 },
  ],
  insights: demoInsights,
  placementScore: demoPlacement,
  streak: demoStudent.streak,
  notifications: [
    { _id: 'n1', message: 'New roadmap milestone unlocked!', type: 'info', read: false, createdAt: new Date() },
    { _id: 'n2', message: 'Your CGPA prediction improved to 8.2!', type: 'success', read: false, createdAt: new Date() },
  ],
};

const demoWeeklyTasks = [
  { _id: 't1', title: 'Solve 5 LeetCode Medium problems', category: 'DSA', completed: true, microTasks: [{ title: 'Two Sum', completed: true }, { title: 'Valid Parentheses', completed: true }] },
  { _id: 't2', title: 'Build REST API for project', category: 'Project', completed: false, microTasks: [{ title: 'Setup Express', completed: true }, { title: 'Create routes', completed: false }] },
  { _id: 't3', title: 'Read OS Chapter 5', category: 'Academics', completed: false, microTasks: [] },
  { _id: 't4', title: 'Practice aptitude (20 problems)', category: 'Placement', completed: false, microTasks: [] },
];

const demoTeacherDashboard = {
  totalStudents: 45,
  avgCGPA: 7.4,
  atRiskCount: 8,
  topPerformers: 12,
  riskBreakdown: { academic: 3, attendance: 2, skills: 3 },
};

module.exports = {
  demoStudent,
  demoMarks,
  demoSkills,
  demoProjects,
  demoRoadmap,
  demoPlacement,
  demoInsights,
  demoDashboard,
  demoWeeklyTasks,
  demoTeacherDashboard,
};
