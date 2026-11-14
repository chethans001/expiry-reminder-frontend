const cron = require('node-cron');
const prisma = require('../config/db');
const { calculateExpiry } = require('../utils/calculateExpiry');
const { sendExpiryReminderEmail } = require('./emailService');

async function runExpiryCheck() {
  console.log('[CRON] Running daily expiry reminder job...');
  try {
    // 1. Fetch all active products (not deleted)
    const products = await prisma.product.findMany({
      where: { isDeleted: false },
      include: {
        category: true,
        user: {
          include: {
            preference: true
          }
        }
      }
    });

    const userEmailsToBatch = new Map(); // userId -> { user, items: [] }

    for (const product of products) {
      const user = product.user;
      if (!user) continue;

      const pref = user.preference || {
        emailNotifications: true,
        inAppNotifications: true,
        notify30Days: true,
        notify15Days: true,
        notify7Days: true,
        notify3Days: true,
        notify1Day: true,
        notifyOnExpiry: true,
        notifyAfterExpiry: true
      };

      const expiryInfo = calculateExpiry(product.expiryDate);
      const days = expiryInfo.daysRemaining;

      // Check if this interval is configured to notify
      let shouldNotify = false;
      let notificationType = 'EXPIRING_SOON';
      let title = '';
      let message = '';

      if (days === 30 && pref.notify30Days) {
        shouldNotify = true;
        title = 'Expiry Notice: 30 Days Left';
        message = `"${product.name}" in ${product.storageLocation} expires in 30 days.`;
      } else if (days === 15 && pref.notify15Days) {
        shouldNotify = true;
        title = 'Expiry Notice: 15 Days Left';
        message = `"${product.name}" in ${product.storageLocation} expires in 15 days.`;
      } else if (days === 7 && pref.notify7Days) {
        shouldNotify = true;
        title = 'Urgent Reminder: 7 Days Left';
        message = `"${product.name}" in ${product.storageLocation} expires in 1 week.`;
      } else if (days === 3 && pref.notify3Days) {
        shouldNotify = true;
        title = 'Urgent Reminder: 3 Days Left';
        message = `"${product.name}" expires in 3 days. Use it soon!`;
      } else if (days === 1 && pref.notify1Day) {
        shouldNotify = true;
        title = 'Urgent Reminder: Expires Tomorrow!';
        message = `"${product.name}" in ${product.storageLocation} expires tomorrow!`;
      } else if (days === 0 && pref.notifyOnExpiry) {
        shouldNotify = true;
        notificationType = 'EXPIRING_TODAY';
        title = 'Expires Today!';
        message = `"${product.name}" reaches its expiry date today!`;
      } else if (days < 0 && days >= -3 && pref.notifyAfterExpiry) {
        // Notify for recently expired items
        shouldNotify = true;
        notificationType = 'EXPIRED';
        title = 'Product Expired';
        message = `"${product.name}" expired ${Math.abs(days)} day(s) ago. Check before using.`;
      }

      if (!shouldNotify) continue;

      // Prevent duplicate notification for the same product and daysRemaining within today
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const existingNotif = await prisma.notification.findFirst({
        where: {
          userId: user.id,
          productId: product.id,
          daysRemaining: days,
          createdAt: { gte: todayStart }
        }
      });

      if (!existingNotif && pref.inAppNotifications) {
        await prisma.notification.create({
          data: {
            userId: user.id,
            productId: product.id,
            title,
            message,
            type: notificationType,
            daysRemaining: days,
            isRead: false
          }
        });

        // Add to email batch if email notifications enabled
        if (pref.emailNotifications && user.email) {
          if (!userEmailsToBatch.has(user.id)) {
            userEmailsToBatch.set(user.id, { user, items: [] });
          }
          userEmailsToBatch.get(user.id).items.push({
            ...product,
            daysRemaining: days,
            label: expiryInfo.label
          });
        }
      }
    }

    // Send batched email to each user who has alerts
    for (const [, { user, items }] of userEmailsToBatch) {
      if (items.length > 0) {
        await sendExpiryReminderEmail(user, items);
      }
    }

    console.log(`[CRON] Expiry check complete. Processed ${products.length} items.`);
  } catch (err) {
    console.error('[CRON] Error during expiry reminder job:', err);
  }
}

function initCron() {
  // Schedule to run every day at 00:05 (5 minutes after midnight)
  cron.schedule('5 0 * * *', () => {
    runExpiryCheck();
  });

  // Also trigger a check after server starts
  setTimeout(() => {
    runExpiryCheck();
  }, 5000);

  console.log('[CRON] Daily notification scheduler initialized.');
}

module.exports = {
  initCron,
  runExpiryCheck
};
