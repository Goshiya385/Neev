const Student = require('../models/Student');
const Marks = require('../models/Marks');
const SkillProgress = require('../models/SkillProgress');

/**
 * Generate dynamic GenZ-style insight messages based on student data
 */
const generateInsights = async (studentId) => {
  const student = await Student.findById(studentId);
  if (!student) return [];

  const insights = [];

  // CGPA insights
  if (student.cgpa >= 8.5) {
    insights.push({
      type: 'achievement',
      icon: '🔥',
      message: `${student.cgpa} CGPA? You're absolutely cooking right now!`,
      color: 'accent2'
    });
  } else if (student.cgpa >= 7.0) {
    insights.push({
      type: 'info',
      icon: '💪',
      message: `${student.cgpa} CGPA — solid foundation. Push for 8+ next sem?`,
      color: 'info'
    });
  } else if (student.cgpa >= 5.0) {
    insights.push({
      type: 'warning',
      icon: '⚡',
      message: `${student.cgpa} CGPA — not the end of the world. Skills > marks, but let's fix this.`,
      color: 'accent'
    });
  } else if (student.cgpa > 0) {
    insights.push({
      type: 'alert',
      icon: '💀',
      message: `Academic comeback arc starts NOW. ${student.cgpa} CGPA is recoverable — we've seen worse.`,
      color: 'danger'
    });
  }

  // Streak insights
  if (student.currentStreak >= 30) {
    insights.push({
      type: 'achievement',
      icon: '🏆',
      message: `${student.currentStreak}-day streak! You're in the top 1% of consistency.`,
      color: 'accent'
    });
  } else if (student.currentStreak >= 7) {
    insights.push({
      type: 'info',
      icon: '🔥',
      message: `${student.currentStreak}-day streak going strong. Don't break the chain!`,
      color: 'accent2'
    });
  } else if (student.currentStreak === 0) {
    insights.push({
      type: 'warning',
      icon: '😴',
      message: `Streak = 0. Even 15 mins today counts. Start small.`,
      color: 'danger'
    });
  }

  // Backlog insight
  if (student.backlogs > 0) {
    insights.push({
      type: 'alert',
      icon: '📚',
      message: `${student.backlogs} backlog${student.backlogs > 1 ? 's' : ''} pending. Clear them before they stack up.`,
      color: 'danger'
    });
  }

  // Semester-based advice
  if (student.semester <= 2) {
    insights.push({
      type: 'info',
      icon: '🌱',
      message: `Sem ${student.semester} is your foundation phase. Focus on basics + building habits.`,
      color: 'info'
    });
  } else if (student.semester >= 5) {
    insights.push({
      type: 'warning',
      icon: '🎯',
      message: `Sem ${student.semester} — placement season is here. Time to convert skills into offers.`,
      color: 'accent'
    });
  }

  // Skills insight
  const skills = await SkillProgress.find({ studentId });
  if (skills.length === 0) {
    insights.push({
      type: 'info',
      icon: '🛠️',
      message: `No skills tracked yet. Add your first skill to start your growth map.`,
      color: 'muted'
    });
  } else {
    const avgCompletion = Math.round(skills.reduce((sum, s) => sum + s.completionPercent, 0) / skills.length);
    if (avgCompletion < 30) {
      insights.push({
        type: 'warning',
        icon: '📈',
        message: `Avg skill completion: ${avgCompletion}%. Let's push these numbers up.`,
        color: 'accent'
      });
    }
  }

  // Placement readiness
  if (student.placementReadiness > 0 && student.placementReadiness < 40 && student.semester >= 3) {
    insights.push({
      type: 'warning',
      icon: '🎪',
      message: `Placement readiness at ${student.placementReadiness}%. Companies want 60%+. Let's grind.`,
      color: 'danger'
    });
  }

  // Career goal
  if (student.careerGoal === 'Not Decided' && student.semester >= 3) {
    insights.push({
      type: 'info',
      icon: '🧭',
      message: `Still "Not Decided" on career? That's okay in Sem 1-2, but Sem ${student.semester}? Let's figure this out.`,
      color: 'accent'
    });
  }

  return insights.slice(0, 5); // Max 5 insights
};

module.exports = { generateInsights };
