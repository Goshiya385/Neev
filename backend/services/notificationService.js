const Notification = require('../models/Notification');

/**
 * Create a notification for a user
 */
const createNotification = async (userId, userType, message, type = 'info') => {
  const notification = new Notification({
    userId,
    userType,
    message,
    type,
  });
  await notification.save();
  return notification;
};

/**
 * Get unread notifications for a user
 */
const getUnreadNotifications = async (userId) => {
  return Notification.find({ userId, read: false })
    .sort({ createdAt: -1 })
    .limit(20);
};

/**
 * Mark notification as read
 */
const markAsRead = async (notificationId) => {
  return Notification.findByIdAndUpdate(notificationId, { read: true }, { new: true });
};

/**
 * Send smart notifications based on student data
 */
const checkAndNotify = async (student) => {
  const notifications = [];

  // Low attendance warning
  // Streak broken
  if (student.currentStreak === 0 && student.longestStreak > 7) {
    notifications.push(
      await createNotification(student._id, 'student',
        `Your ${student.longestStreak}-day streak broke! Start again today 💪`,
        'reminder'
      )
    );
  }

  // Backlog alert
  if (student.backlogs > 0) {
    notifications.push(
      await createNotification(student._id, 'student',
        `You have ${student.backlogs} backlog(s). Clear them before next semester.`,
        'warning'
      )
    );
  }

  // Achievement: high CGPA
  if (student.cgpa >= 9.0) {
    notifications.push(
      await createNotification(student._id, 'student',
        `CGPA ${student.cgpa}! You're in the elite zone 🏆`,
        'achievement'
      )
    );
  }

  return notifications;
};

module.exports = { createNotification, getUnreadNotifications, markAsRead, checkAndNotify };
