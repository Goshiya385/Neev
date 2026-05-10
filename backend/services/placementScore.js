const SkillProgress = require('../models/SkillProgress');
const Project = require('../models/Project');
const MockTest = require('../models/MockTest');
const Student = require('../models/Student');
const { PLACEMENT_WEIGHTS } = require('../config/constants');

/**
 * Calculate placement readiness score for a student
 * Breakdown: DSA Skills, Projects, Communication, Aptitude, CGPA, GitHub, Mock Tests
 */
const calculatePlacementScore = async (studentId) => {
  const student = await Student.findById(studentId);
  if (!student) throw new Error('Student not found');

  // DSA Skills score (25%)
  const dsaSkills = await SkillProgress.find({
    studentId,
    category: { $in: ['language', 'cs-core'] }
  });
  const dsaAvg = dsaSkills.length > 0
    ? dsaSkills.reduce((sum, s) => sum + s.completionPercent, 0) / dsaSkills.length
    : 0;

  // Projects score (20%)
  const projects = await Project.find({ studentId });
  const completedProjects = projects.filter(p => p.status === 'completed').length;
  const projectScore = Math.min(completedProjects * 25, 100); // 4 completed = 100%

  // Communication score (15%)
  const commScore = student.softSkills
    ? ((student.softSkills.englishFluency || 0) + (student.softSkills.communicationConfidence || 0)) * 5
    : 0;

  // Aptitude score (15%)
  const aptitudeTests = await MockTest.find({ studentId, testType: 'aptitude' });
  const aptitudeAvg = aptitudeTests.length > 0
    ? aptitudeTests.reduce((sum, t) => sum + (t.score / t.maxScore * 100), 0) / aptitudeTests.length
    : (student.softSkills?.aptitudeLevel || 0) * 10;

  // CGPA score (10%)
  const cgpaScore = student.cgpa ? (student.cgpa / 10) * 100 : 0;

  // GitHub score (5%)
  const githubScore = student.techProfile?.githubUrl ? 60 : 0;
  const githubBonus = projects.filter(p => p.githubUrl).length * 10;
  const finalGithub = Math.min(githubScore + githubBonus, 100);

  // Mock Tests score (10%)
  const allMocks = await MockTest.find({ studentId });
  const mockAvg = allMocks.length > 0
    ? allMocks.reduce((sum, t) => sum + (t.score / t.maxScore * 100), 0) / allMocks.length
    : 0;

  // Weighted total
  const totalScore = Math.round(
    dsaAvg * PLACEMENT_WEIGHTS.dsaSkills +
    projectScore * PLACEMENT_WEIGHTS.projects +
    commScore * PLACEMENT_WEIGHTS.communication +
    aptitudeAvg * PLACEMENT_WEIGHTS.aptitude +
    cgpaScore * PLACEMENT_WEIGHTS.cgpa +
    finalGithub * PLACEMENT_WEIGHTS.github +
    mockAvg * PLACEMENT_WEIGHTS.mockTests
  );

  const breakdown = {
    dsaSkills: Math.round(dsaAvg),
    projects: Math.round(projectScore),
    communication: Math.round(commScore),
    aptitude: Math.round(aptitudeAvg),
    cgpa: Math.round(cgpaScore),
    github: Math.round(finalGithub),
    mockTests: Math.round(mockAvg),
    total: Math.min(totalScore, 100),
  };

  // Update student record
  await Student.findByIdAndUpdate(studentId, { placementReadiness: breakdown.total });

  return breakdown;
};

module.exports = { calculatePlacementScore };
