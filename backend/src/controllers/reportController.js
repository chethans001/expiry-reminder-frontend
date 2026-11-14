const prisma = require('../config/db');
const { calculateExpiry } = require('../utils/calculateExpiry');

// 1. Dashboard Statistics & Personal Overview
exports.getDashboardOverview = async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch all active items
    const items = await prisma.product.findMany({
      where: { userId, isDeleted: false },
      include: { category: true },
      orderBy: { expiryDate: 'asc' }
    });

    // Enrich with calculated expiry
    const enriched = items.map(item => ({
      ...item,
      ...calculateExpiry(item.expiryDate)
    }));

    // Calculate counts
    const totalItems = enriched.length;
    const safeItems = enriched.filter(i => i.status === 'Safe').length;
    const expiringSoon = enriched.filter(i => i.status === 'Expiring Soon').length;
    const expiringToday = enriched.filter(i => i.status === 'Expiring Today').length;
    const expiredItems = enriched.filter(i => i.status === 'Expired').length;
    const favoriteItems = enriched.filter(i => i.isFavorite).length;

    // Items expiring within 7 days
    const expiringThisWeek = enriched.filter(i => i.daysRemaining >= 0 && i.daysRemaining <= 7).length;
    // Items expiring within 30 days
    const expiringThisMonth = enriched.filter(i => i.daysRemaining >= 0 && i.daysRemaining <= 30).length;

    // Category breakdown
    const categoryMap = {};
    enriched.forEach(item => {
      const catName = item.category?.name || 'Other';
      if (!categoryMap[catName]) {
        categoryMap[catName] = {
          name: catName,
          count: 0,
          color: item.category?.color || '#6366F1',
          icon: item.category?.icon || 'Tag'
        };
      }
      categoryMap[catName].count += 1;
    });
    const categoryBreakdown = Object.values(categoryMap).sort((a, b) => b.count - a.count);

    // Location breakdown
    const locationMap = {};
    enriched.forEach(item => {
      const loc = item.storageLocation || 'Other';
      locationMap[loc] = (locationMap[loc] || 0) + 1;
    });
    const locationBreakdown = Object.entries(locationMap).map(([location, count]) => ({
      location,
      count
    })).sort((a, b) => b.count - a.count);

    // Expiry distribution (for charts)
    const distribution = [
      { name: 'Expired', count: expiredItems, color: '#f43f5e' },
      { name: 'Expiring Today', count: expiringToday, color: '#f59e0b' },
      { name: '1-7 Days', count: enriched.filter(i => i.daysRemaining >= 1 && i.daysRemaining <= 7).length, color: '#fb923c' },
      { name: '8-30 Days', count: enriched.filter(i => i.daysRemaining >= 8 && i.daysRemaining <= 30).length, color: '#818cf8' },
      { name: 'Safe (30+ Days)', count: safeItems, color: '#10b981' }
    ];

    // Upcoming urgent reminders (up to 6 items)
    const upcomingReminders = enriched
      .filter(i => i.daysRemaining >= 0)
      .slice(0, 6);

    // Recently added items (top 5)
    const recentlyAdded = [...enriched]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    // Urgent alerts (expired or today)
    const urgentAlerts = enriched.filter(i => i.daysRemaining <= 0);

    return res.json({
      success: true,
      stats: {
        totalItems,
        safeItems,
        expiringSoon,
        expiringToday,
        expiredItems,
        expiringThisWeek,
        expiringThisMonth,
        favoriteItems
      },
      distribution,
      categoryBreakdown,
      locationBreakdown,
      upcomingReminders,
      recentlyAdded,
      urgentAlerts
    });
  } catch (error) {
    console.error('Dashboard overview error:', error);
    return res.status(500).json({ success: false, message: 'Failed to generate overview statistics.' });
  }
};

// 2. Comprehensive Personal Report Data
exports.getReportData = async (req, res) => {
  try {
    const userId = req.user.id;

    const items = await prisma.product.findMany({
      where: { userId, isDeleted: false },
      include: { category: true },
      orderBy: { expiryDate: 'asc' }
    });

    const enriched = items.map(item => ({
      ...item,
      ...calculateExpiry(item.expiryDate)
    }));

    const thisWeek = enriched.filter(i => i.daysRemaining >= 0 && i.daysRemaining <= 7);
    const thisMonth = enriched.filter(i => i.daysRemaining >= 0 && i.daysRemaining <= 30);
    const expired = enriched.filter(i => i.daysRemaining < 0);
    const safe = enriched.filter(i => i.daysRemaining > 30);

    return res.json({
      success: true,
      summary: {
        total: enriched.length,
        expiringThisWeekCount: thisWeek.length,
        expiringThisMonthCount: thisMonth.length,
        expiredCount: expired.length,
        safeCount: safe.length
      },
      items: enriched,
      thisWeek,
      thisMonth,
      expired
    });
  } catch (error) {
    console.error('Report data error:', error);
    return res.status(500).json({ success: false, message: 'Failed to generate report.' });
  }
};

// 3. Export CSV Data
exports.exportCSV = async (req, res) => {
  try {
    const userId = req.user.id;

    const items = await prisma.product.findMany({
      where: { userId, isDeleted: false },
      include: { category: true },
      orderBy: { expiryDate: 'asc' }
    });

    const enriched = items.map(item => ({
      ...item,
      ...calculateExpiry(item.expiryDate)
    }));

    // Build CSV string
    const headers = [
      'Item Name',
      'Category',
      'Brand',
      'Quantity',
      'Unit',
      'Storage Location',
      'Expiry Date',
      'Days Remaining',
      'Status',
      'Purchase Date',
      'Notes'
    ];

    const escapeCsv = (str) => {
      if (!str) return '""';
      const clean = String(str).replace(/"/g, '""');
      return `"${clean}"`;
    };

    const rows = enriched.map(i => [
      escapeCsv(i.name),
      escapeCsv(i.category?.name || 'Uncategorized'),
      escapeCsv(i.brand || ''),
      i.quantity,
      escapeCsv(i.unit),
      escapeCsv(i.storageLocation),
      escapeCsv(new Date(i.expiryDate).toISOString().split('T')[0]),
      i.daysRemaining,
      escapeCsv(i.status),
      escapeCsv(i.purchaseDate ? new Date(i.purchaseDate).toISOString().split('T')[0] : ''),
      escapeCsv(i.notes || '')
    ].join(','));

    const csvContent = [headers.join(','), ...rows].join('\r\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="my_expiry_items.csv"');
    return res.send(csvContent);
  } catch (error) {
    console.error('Export CSV error:', error);
    return res.status(500).json({ success: false, message: 'Failed to export CSV.' });
  }
};
