module.exports = {
  BRANCHES: ['CS', 'IT', 'AI', 'ML', 'ECE', 'EE', 'ME', 'CE'],
  
  CAREER_GOALS: [
    'Web Development', 'Full Stack', 'AI/ML', 'Data Science',
    'Cybersecurity', 'UI/UX', 'Government Job', 'Startup',
    'Higher Studies', 'Freelancing', 'Research', 'Not Decided'
  ],

  SKILL_CATEGORIES: ['language', 'cs-core', 'development', 'tools', 'future-tech'],

  PROJECT_STATUSES: ['idea', 'in-progress', 'completed'],

  EXAM_TYPES: ['internal', 'external', 'practical', 'assignment'],

  ATTENDANCE_STATUSES: ['present', 'absent', 'late'],

  NOTIFICATION_TYPES: ['warning', 'reminder', 'achievement', 'alert', 'info'],

  MOCK_TEST_TYPES: ['aptitude', 'coding', 'core-subject', 'hr', 'mock-interview'],

  // Default roadmap milestones by semester
  SEMESTER_MILESTONES: {
    1: [
      { title: 'Learn C/C++ basics', category: 'technical', dueWeek: 4 },
      { title: 'Create GitHub profile', category: 'github', dueWeek: 2 },
      { title: 'Join coding platform (LeetCode/HackerRank)', category: 'technical', dueWeek: 3 },
      { title: 'Basic aptitude practice (30 questions)', category: 'aptitude', dueWeek: 8 },
      { title: 'Write first program independently', category: 'technical', dueWeek: 6 },
      { title: 'English vocabulary building (50 words)', category: 'english', dueWeek: 10 },
      { title: 'Attend 1 tech talk/webinar', category: 'project', dueWeek: 12 },
    ],
    2: [
      { title: 'Complete DSA basics (Arrays, Strings, Sorting)', category: 'technical', dueWeek: 6 },
      { title: 'Build 1 mini project', category: 'project', dueWeek: 10 },
      { title: 'Push 3 repos to GitHub', category: 'github', dueWeek: 12 },
      { title: 'Solve 50 coding problems', category: 'technical', dueWeek: 14 },
      { title: 'Practice group discussions', category: 'english', dueWeek: 8 },
      { title: 'Learn Git basics', category: 'tools', dueWeek: 4 },
    ],
    3: [
      { title: 'Complete OOP concepts deeply', category: 'technical', dueWeek: 4 },
      { title: 'Learn a framework (React/Django/Express)', category: 'technical', dueWeek: 10 },
      { title: 'Build 1 full-stack project', category: 'project', dueWeek: 14 },
      { title: 'Solve 100 DSA problems', category: 'technical', dueWeek: 16 },
      { title: 'Create LinkedIn profile', category: 'github', dueWeek: 2 },
      { title: 'Practice aptitude (100 questions)', category: 'aptitude', dueWeek: 12 },
      { title: 'Write 1 technical blog', category: 'english', dueWeek: 8 },
    ],
    4: [
      { title: 'Master 2+ DSA categories (Trees, Graphs, DP)', category: 'technical', dueWeek: 10 },
      { title: 'Build 2 projects with real-world use case', category: 'project', dueWeek: 14 },
      { title: 'Deploy a project live', category: 'project', dueWeek: 12 },
      { title: 'Open source contribution', category: 'github', dueWeek: 16 },
      { title: 'Mock interview practice (2 sessions)', category: 'aptitude', dueWeek: 14 },
      { title: 'Resume draft v1', category: 'english', dueWeek: 10 },
      { title: 'Solve 200 DSA problems total', category: 'technical', dueWeek: 16 },
    ],
    5: [
      { title: 'Complete system design basics', category: 'technical', dueWeek: 8 },
      { title: 'Build capstone/major project', category: 'project', dueWeek: 14 },
      { title: 'Solve 300 DSA problems total', category: 'technical', dueWeek: 16 },
      { title: 'Apply for internships', category: 'project', dueWeek: 6 },
      { title: 'Final resume polish', category: 'english', dueWeek: 4 },
      { title: 'Mock interviews (5 sessions)', category: 'aptitude', dueWeek: 12 },
      { title: 'Company-specific prep (TCS/Infosys/Wipro)', category: 'aptitude', dueWeek: 14 },
    ],
    6: [
      { title: 'Placement drives preparation', category: 'aptitude', dueWeek: 2 },
      { title: 'Final project documentation', category: 'project', dueWeek: 8 },
      { title: 'Portfolio website live', category: 'github', dueWeek: 4 },
      { title: 'Advanced system design', category: 'technical', dueWeek: 10 },
      { title: 'Behavioral interview prep', category: 'english', dueWeek: 6 },
      { title: 'Company research (top 5 targets)', category: 'aptitude', dueWeek: 4 },
    ],
  },

  // Placement readiness weights
  PLACEMENT_WEIGHTS: {
    dsaSkills: 0.25,
    projects: 0.20,
    communication: 0.15,
    aptitude: 0.15,
    cgpa: 0.10,
    github: 0.05,
    mockTests: 0.10,
  },

  // Company prep packs
  COMPANY_PACKS: {
    TCS: {
      name: 'TCS Digital / Ninja',
      sections: ['Aptitude', 'Verbal', 'Programming', 'Email Writing'],
      cgpaCutoff: 6.0,
      tips: ['Focus on aptitude speed', 'Practice email writing format', 'TCS NQT pattern questions'],
    },
    Infosys: {
      name: 'Infosys (Power Programmer / SP)',
      sections: ['Aptitude', 'Pseudo Code', 'Puzzle Solving', 'Programming'],
      cgpaCutoff: 6.0,
      tips: ['InfyTQ practice', 'Pseudo code tracing', 'Certification courses on Infosys Springboard'],
    },
    Wipro: {
      name: 'Wipro (Elite / Turbo)',
      sections: ['Aptitude', 'Verbal', 'Coding', 'Essay Writing'],
      cgpaCutoff: 6.0,
      tips: ['Practice online assessments', 'Focus on time management'],
    },
    Amazon: {
      name: 'Amazon SDE Intern',
      sections: ['DSA (Medium-Hard)', 'System Design Basics', 'Leadership Principles'],
      cgpaCutoff: 7.0,
      tips: ['Focus on Trees, Graphs, DP', 'Practice behavioral questions using STAR method'],
    },
    Google: {
      name: 'Google SWE Intern',
      sections: ['DSA (Hard)', 'System Design', 'Googleyness'],
      cgpaCutoff: 7.5,
      tips: ['LeetCode Hard problems', 'Read "Cracking the Coding Interview"', 'Focus on clean code'],
    },
    Microsoft: {
      name: 'Microsoft SDE Intern',
      sections: ['DSA', 'System Design', 'Problem Solving'],
      cgpaCutoff: 7.0,
      tips: ['Group fly round practice', 'Focus on Arrays, Strings, Trees', 'Clean code matters'],
    },
  },
};
