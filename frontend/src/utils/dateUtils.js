export function calculateExpiry(expiryDateInput) {
  if (!expiryDateInput) return null;

  const expiry = new Date(expiryDateInput);
  const today = new Date();

  const expUtc = Date.UTC(expiry.getFullYear(), expiry.getMonth(), expiry.getDate());
  const todayUtc = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());

  const msPerDay = 1000 * 60 * 60 * 24;
  const daysRemaining = Math.round((expUtc - todayUtc) / msPerDay);

  let status = 'Safe';
  let badgeColor = 'emerald';
  let urgency = 'safe';
  let label = '';

  if (daysRemaining < 0) {
    status = 'Expired';
    badgeColor = 'rose';
    urgency = 'critical';
    const absDays = Math.abs(daysRemaining);
    label = absDays === 1 ? 'Expired yesterday' : `Expired ${absDays} days ago`;
  } else if (daysRemaining === 0) {
    status = 'Expiring Today';
    badgeColor = 'amber';
    urgency = 'high';
    label = 'Expires today!';
  } else if (daysRemaining <= 3) {
    status = 'Expiring Soon';
    badgeColor = 'orange';
    urgency = 'high';
    label = daysRemaining === 1 ? 'Expires tomorrow' : `Expires in ${daysRemaining} days`;
  } else if (daysRemaining <= 7) {
    status = 'Expiring Soon';
    badgeColor = 'amber';
    urgency = 'medium';
    label = `Expires in ${daysRemaining} days`;
  } else if (daysRemaining <= 30) {
    status = 'Expiring Soon';
    badgeColor = 'indigo';
    urgency = 'low';
    label = `Expires in ${daysRemaining} days`;
  } else {
    status = 'Safe';
    badgeColor = 'emerald';
    urgency = 'safe';
    label = `Safe (${daysRemaining} days left)`;
  }

  return {
    daysRemaining,
    status,
    badgeColor,
    urgency,
    label,
    isUrgent: daysRemaining >= 0 && daysRemaining <= 7,
    isExpired: daysRemaining < 0,
    isExpiringToday: daysRemaining === 0
  };
}

export function formatDisplayDate(dateInput) {
  if (!dateInput) return '—';
  const d = new Date(dateInput);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

export function formatShortDate(dateInput) {
  if (!dateInput) return '—';
  const d = new Date(dateInput);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
}

export function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}
