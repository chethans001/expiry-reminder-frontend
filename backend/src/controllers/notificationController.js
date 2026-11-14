const prisma = require('../config/db');
const { runExpiryCheck } = require('../services/cronService');

// 1. Get User Notifications
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            storageLocation: true,
            expiryDate: true,
            imageUrl: true
          }
        }
      }
    });

    const unreadCount = await prisma.notification.count({
      where: { userId, isRead: false }
    });

    return res.json({
      success: true,
      unreadCount,
      notifications
    });
  } catch (error) {
    console.error('Fetch notifications error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch notifications.' });
  }
};

// 2. Mark Single Notification as Read
exports.markAsRead = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);

    const notif = await prisma.notification.findFirst({
      where: { id, userId: req.user.id }
    });

    if (!notif) {
      return res.status(404).json({ success: false, message: 'Notification not found.' });
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true }
    });

    return res.json({ success: true, notification: updated });
  } catch (error) {
    console.error('Mark read error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update notification.' });
  }
};

// 3. Mark All Notifications as Read
exports.markAllAsRead = async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.id, isRead: false },
      data: { isRead: true }
    });

    return res.json({
      success: true,
      message: 'All notifications marked as read.'
    });
  } catch (error) {
    console.error('Mark all read error:', error);
    return res.status(500).json({ success: false, message: 'Failed to mark all as read.' });
  }
};

// 4. Delete Notification
exports.deleteNotification = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);

    await prisma.notification.deleteMany({
      where: { id, userId: req.user.id }
    });

    return res.json({
      success: true,
      message: 'Notification deleted.'
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete notification.' });
  }
};

// 5. Clear All Notifications
exports.clearAllNotifications = async (req, res) => {
  try {
    await prisma.notification.deleteMany({
      where: { userId: req.user.id }
    });

    return res.json({
      success: true,
      message: 'All notifications cleared.'
    });
  } catch (error) {
    console.error('Clear all error:', error);
    return res.status(500).json({ success: false, message: 'Failed to clear notifications.' });
  }
};

// 6. Get User Notification Preferences
exports.getPreferences = async (req, res) => {
  try {
    let pref = await prisma.notificationPreference.findUnique({
      where: { userId: req.user.id }
    });

    if (!pref) {
      pref = await prisma.notificationPreference.create({
        data: {
          userId: req.user.id,
          emailNotifications: true,
          inAppNotifications: true,
          notify30Days: true,
          notify15Days: true,
          notify7Days: true,
          notify3Days: true,
          notify1Day: true,
          notifyOnExpiry: true,
          notifyAfterExpiry: true
        }
      });
    }

    return res.json({ success: true, preferences: pref });
  } catch (error) {
    console.error('Get preferences error:', error);
    return res.status(500).json({ success: false, message: 'Failed to get notification preferences.' });
  }
};

// 7. Update User Notification Preferences
exports.updatePreferences = async (req, res) => {
  try {
    const {
      emailNotifications,
      inAppNotifications,
      notify30Days,
      notify15Days,
      notify7Days,
      notify3Days,
      notify1Day,
      notifyOnExpiry,
      notifyAfterExpiry
    } = req.body;

    const pref = await prisma.notificationPreference.upsert({
      where: { userId: req.user.id },
      update: {
        ...(emailNotifications !== undefined && { emailNotifications }),
        ...(inAppNotifications !== undefined && { inAppNotifications }),
        ...(notify30Days !== undefined && { notify30Days }),
        ...(notify15Days !== undefined && { notify15Days }),
        ...(notify7Days !== undefined && { notify7Days }),
        ...(notify3Days !== undefined && { notify3Days }),
        ...(notify1Day !== undefined && { notify1Day }),
        ...(notifyOnExpiry !== undefined && { notifyOnExpiry }),
        ...(notifyAfterExpiry !== undefined && { notifyAfterExpiry })
      },
      create: {
        userId: req.user.id,
        emailNotifications: emailNotifications ?? true,
        inAppNotifications: inAppNotifications ?? true,
        notify30Days: notify30Days ?? true,
        notify15Days: notify15Days ?? true,
        notify7Days: notify7Days ?? true,
        notify3Days: notify3Days ?? true,
        notify1Day: notify1Day ?? true,
        notifyOnExpiry: notifyOnExpiry ?? true,
        notifyAfterExpiry: notifyAfterExpiry ?? true
      }
    });

    return res.json({
      success: true,
      message: 'Reminder preferences updated successfully.',
      preferences: pref
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update reminder preferences.' });
  }
};

// 8. Trigger Manual Expiry Check (for instant testing)
exports.triggerCheck = async (req, res) => {
  try {
    await runExpiryCheck();
    return res.json({
      success: true,
      message: 'Expiry check triggered successfully.'
    });
  } catch (error) {
    console.error('Trigger check error:', error);
    return res.status(500).json({ success: false, message: 'Failed to run check.' });
  }
};
