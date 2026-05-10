const RoadmapProgress = require('../models/RoadmapProgress');
const Student = require('../models/Student');
const { SEMESTER_MILESTONES } = require('../config/constants');

/**
 * Generate or get the roadmap for a student's current semester
 */
const generateRoadmap = async (studentId) => {
  const student = await Student.findById(studentId);
  if (!student) throw new Error('Student not found');

  const semester = student.semester;

  // Check if roadmap already exists
  let roadmap = await RoadmapProgress.findOne({ studentId, semester });
  if (roadmap) return roadmap;

  // Create new roadmap from semester template
  const milestoneTemplates = SEMESTER_MILESTONES[semester] || SEMESTER_MILESTONES[1];
  
  const milestones = milestoneTemplates.map(m => ({
    title: m.title,
    category: m.category,
    expected: true,
    completed: false,
    dueWeek: m.dueWeek,
  }));

  // Add career-specific milestones based on career goal
  const careerMilestones = getCareerSpecificMilestones(student.careerGoal, semester);
  milestones.push(...careerMilestones);

  roadmap = new RoadmapProgress({
    studentId,
    semester,
    milestones,
  });

  await roadmap.save();
  return roadmap;
};

/**
 * Add career-specific milestones
 */
const getCareerSpecificMilestones = (careerGoal, semester) => {
  const extras = [];

  if (['Web Development', 'Full Stack'].includes(careerGoal)) {
    if (semester >= 2) extras.push({ title: 'Learn HTML/CSS/JS deeply', category: 'technical', expected: true, completed: false, dueWeek: 8 });
    if (semester >= 3) extras.push({ title: 'Build a React/Next.js project', category: 'project', expected: true, completed: false, dueWeek: 12 });
    if (semester >= 4) extras.push({ title: 'Learn backend (Node.js/Django)', category: 'technical', expected: true, completed: false, dueWeek: 10 });
  }

  if (['AI/ML', 'Data Science'].includes(careerGoal)) {
    if (semester >= 2) extras.push({ title: 'Learn Python + NumPy/Pandas', category: 'technical', expected: true, completed: false, dueWeek: 8 });
    if (semester >= 3) extras.push({ title: 'Complete ML fundamentals course', category: 'technical', expected: true, completed: false, dueWeek: 12 });
    if (semester >= 4) extras.push({ title: 'Build an ML project with real data', category: 'project', expected: true, completed: false, dueWeek: 14 });
  }

  if (careerGoal === 'Cybersecurity') {
    if (semester >= 2) extras.push({ title: 'Learn networking basics', category: 'technical', expected: true, completed: false, dueWeek: 8 });
    if (semester >= 3) extras.push({ title: 'TryHackMe / HackTheBox practice', category: 'technical', expected: true, completed: false, dueWeek: 12 });
  }

  if (careerGoal === 'UI/UX') {
    if (semester >= 2) extras.push({ title: 'Learn Figma basics', category: 'tools', expected: true, completed: false, dueWeek: 6 });
    if (semester >= 3) extras.push({ title: 'Design 3 UI case studies', category: 'project', expected: true, completed: false, dueWeek: 12 });
  }

  return extras;
};

/**
 * Calculate expected vs actual progress
 */
const getProgressComparison = async (studentId) => {
  const student = await Student.findById(studentId);
  if (!student) throw new Error('Student not found');

  const roadmap = await RoadmapProgress.findOne({ studentId, semester: student.semester });
  if (!roadmap) return { expected: 0, actual: 0, gap: 0 };

  // Calculate expected progress based on current week
  const semesterStart = new Date(new Date().getFullYear(), (student.semester % 2 === 1) ? 6 : 0, 1);
  const now = new Date();
  const weeksPassed = Math.floor((now - semesterStart) / (7 * 24 * 60 * 60 * 1000));

  const expectedMilestones = roadmap.milestones.filter(m => m.dueWeek <= weeksPassed);
  const expectedProgress = roadmap.milestones.length > 0
    ? Math.round((expectedMilestones.length / roadmap.milestones.length) * 100)
    : 0;

  return {
    expected: expectedProgress,
    actual: roadmap.overallProgress,
    gap: expectedProgress - roadmap.overallProgress,
    totalMilestones: roadmap.milestones.length,
    completedMilestones: roadmap.milestones.filter(m => m.completed).length,
    weeksPassed,
  };
};

module.exports = { generateRoadmap, getProgressComparison, getCareerSpecificMilestones };
