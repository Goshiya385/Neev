const Marks = require('../models/Marks');
const SkillProgress = require('../models/SkillProgress');
const Project = require('../models/Project');
const Attendance = require('../models/Attendance');
const RoadmapProgress = require('../models/RoadmapProgress');
const MockTest = require('../models/MockTest');
const Student = require('../models/Student');

/**
 * Generate comprehensive semester report data (Spotify Wrapped style)
 */
const generateSemesterReport = async (studentId, semester) => {
  const student = await Student.findById(studentId);
  if (!student) throw new Error('Student not found');

  // Marks data
  const marks = await Marks.find({ studentId, semester });
  const totalMarks = marks.reduce((sum, m) => sum + m.internalMarks + m.externalMarks + m.practicalMarks, 0);
  const maxMarks = marks.reduce((sum, m) => sum + m.maxInternal + m.maxExternal + m.maxPractical, 0);
  const percentage = maxMarks > 0 ? Math.round((totalMarks / maxMarks) * 100) : 0;

  // Best and worst subjects
  const subjectScores = marks.map(m => ({
    subject: m.subject,
    total: m.internalMarks + m.externalMarks + m.practicalMarks,
    max: m.maxInternal + m.maxExternal + m.maxPractical,
    percentage: Math.round(((m.internalMarks + m.externalMarks + m.practicalMarks) / (m.maxInternal + m.maxExternal + m.maxPractical)) * 100)
  })).sort((a, b) => b.percentage - a.percentage);

  const bestSubject = subjectScores[0] || null;
  const worstSubject = subjectScores[subjectScores.length - 1] || null;

  // Attendance
  const attendance = await Attendance.find({ studentId, semester });
  const totalClasses = attendance.length;
  const presentClasses = attendance.filter(a => a.status === 'present' || a.status === 'late').length;
  const attendancePct = totalClasses > 0 ? Math.round((presentClasses / totalClasses) * 100) : 0;

  // Skills gained this semester
  const skills = await SkillProgress.find({ studentId });
  const activeSkills = skills.filter(s => s.completionPercent > 0);

  // Projects this semester
  const projects = await Project.find({ studentId, semester });

  // Roadmap progress
  const roadmap = await RoadmapProgress.findOne({ studentId, semester });

  // Mock tests
  const mocks = await MockTest.find({ studentId });

  // Generate "wrapped" style stats
  const report = {
    studentName: student.name,
    semester,
    cgpa: student.cgpa,

    // Academic wrapped
    academics: {
      totalSubjects: marks.length,
      percentage,
      bestSubject: bestSubject ? { name: bestSubject.subject, percentage: bestSubject.percentage } : null,
      worstSubject: worstSubject ? { name: worstSubject.subject, percentage: worstSubject.percentage } : null,
      subjectScores,
    },

    // Attendance wrapped
    attendance: {
      totalClasses,
      presentClasses,
      percentage: attendancePct,
      verdict: attendancePct >= 85 ? '✅ Safe' : attendancePct >= 75 ? '⚠️ Borderline' : '❌ Danger Zone',
    },

    // Skills wrapped
    skills: {
      totalTracked: skills.length,
      activelyWorking: activeSkills.length,
      topSkill: activeSkills.sort((a, b) => b.completionPercent - a.completionPercent)[0] || null,
      avgCompletion: activeSkills.length > 0
        ? Math.round(activeSkills.reduce((sum, s) => sum + s.completionPercent, 0) / activeSkills.length)
        : 0,
    },

    // Projects wrapped
    projects: {
      total: projects.length,
      completed: projects.filter(p => p.status === 'completed').length,
      inProgress: projects.filter(p => p.status === 'in-progress').length,
    },

    // Roadmap wrapped
    roadmap: {
      overallProgress: roadmap?.overallProgress || 0,
      totalMilestones: roadmap?.milestones?.length || 0,
      completedMilestones: roadmap?.milestones?.filter(m => m.completed).length || 0,
    },

    // Streaks
    streaks: {
      currentStreak: student.currentStreak,
      longestStreak: student.longestStreak,
    },

    // Placement
    placementReadiness: student.placementReadiness,
    mockTests: {
      total: mocks.length,
      avgScore: mocks.length > 0
        ? Math.round(mocks.reduce((sum, m) => sum + (m.score / m.maxScore * 100), 0) / mocks.length)
        : 0,
    },

    // Fun stats
    funStats: {
      personality: getPersonality(student, percentage, attendancePct),
      topEmoji: getTopEmoji(student.cgpa, student.currentStreak),
    },
  };

  return report;
};

function getPersonality(student, percentage, attendancePct) {
  if (student.cgpa >= 9 && student.currentStreak >= 30) return '🧠 The Machine — You don\'t stop.';
  if (student.cgpa >= 8) return '📚 The Scholar — Consistent and reliable.';
  if (student.currentStreak >= 14) return '🔥 The Grinder — Streak monster.';
  if (percentage >= 70 && attendancePct >= 80) return '⚡ The All-Rounder — Good everywhere.';
  if (student.backlogs > 0) return '💀 The Phoenix — Rising from the ashes.';
  return '🌱 The Seedling — Just getting started.';
}

function getTopEmoji(cgpa, streak) {
  if (cgpa >= 9) return '👑';
  if (cgpa >= 8) return '🔥';
  if (streak >= 7) return '⚡';
  if (cgpa >= 6) return '💪';
  return '🌱';
}

module.exports = { generateSemesterReport };
