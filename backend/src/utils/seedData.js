const bcrypt = require('bcryptjs');
const prisma = require('../config/db');

const DEFAULT_CATEGORIES = [
  { name: 'Food', icon: 'Utensils', color: '#10B981' },
  { name: 'Dairy Products', icon: 'Milk', color: '#3B82F6' },
  { name: 'Fruits and Vegetables', icon: 'Apple', color: '#22C55E' },
  { name: 'Beverages', icon: 'Coffee', color: '#F59E0B' },
  { name: 'Medicines', icon: 'Pill', color: '#EF4444' },
  { name: 'Cosmetics', icon: 'Sparkles', color: '#EC4899' },
  { name: 'Skincare', icon: 'Heart', color: '#F43F5E' },
  { name: 'Personal Care', icon: 'Smile', color: '#8B5CF6' },
  { name: 'Household Products', icon: 'Home', color: '#6366F1' },
  { name: 'Cleaning Products', icon: 'Sparkle', color: '#06B6D4' },
  { name: 'Baby Products', icon: 'Baby', color: '#A855F7' },
  { name: 'Other', icon: 'Package', color: '#64748B' }
];

async function seed() {
  console.log('Seeding initial data...');

  // 1. Seed Default Categories (isDefault: true, userId: null)
  for (const cat of DEFAULT_CATEGORIES) {
    const existing = await prisma.category.findFirst({
      where: { name: cat.name, isDefault: true }
    });
    if (!existing) {
      await prisma.category.create({
        data: {
          name: cat.name,
          icon: cat.icon,
          color: cat.color,
          isDefault: true
        }
      });
    }
  }
  console.log('Default categories verified.');

  // 2. Seed Demo User
  const demoEmail = 'demo@expiryreminder.local';
  let demoUser = await prisma.user.findUnique({
    where: { email: demoEmail }
  });

  if (!demoUser) {
    const hashedPassword = await bcrypt.hash('Password123!', 10);
    demoUser = await prisma.user.create({
      data: {
        name: 'Alex Johnson',
        email: demoEmail,
        password: hashedPassword,
        preference: {
          create: {
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
        }
      }
    });
    console.log('Demo user created (Email: demo@expiryreminder.local, Password: Password123!)');
  } else {
    console.log('Demo user already exists.');
  }

  // 3. Seed Sample Products for Demo User
  const existingCount = await prisma.product.count({
    where: { userId: demoUser.id }
  });

  if (existingCount === 0) {
    const categories = await prisma.category.findMany();
    const catMap = {};
    categories.forEach(c => { catMap[c.name] = c.id; });

    const now = new Date();
    const daysOffset = (d) => {
      const date = new Date(now);
      date.setDate(date.getDate() + d);
      return date;
    };

    const sampleProducts = [
      {
        name: 'Whole Milk 1L',
        brand: 'Horizon Organic',
        categoryId: catMap['Dairy Products'] || categories[0].id,
        quantity: 2,
        unit: 'bottles',
        storageLocation: 'Refrigerator',
        purchaseDate: daysOffset(-5),
        expiryDate: daysOffset(2), // Expiring Soon (2 days)
        notes: 'Keep chilled on top refrigerator shelf.',
        isFavorite: true
      },
      {
        name: 'Whole Wheat Sandwich Bread',
        brand: 'Nature Valley',
        categoryId: catMap['Food'] || categories[0].id,
        quantity: 1,
        unit: 'pack',
        storageLocation: 'Kitchen',
        purchaseDate: daysOffset(-4),
        expiryDate: daysOffset(0), // Expiring Today
        notes: 'Best for morning breakfast sandwiches.',
        isFavorite: true
      },
      {
        name: 'Fresh Strawberries',
        brand: 'Local Farm',
        categoryId: catMap['Fruits and Vegetables'] || categories[0].id,
        quantity: 500,
        unit: 'grams',
        storageLocation: 'Refrigerator',
        purchaseDate: daysOffset(-6),
        expiryDate: daysOffset(-1), // Expired 1 day ago
        notes: 'Check before using in smoothies.'
      },
      {
        name: 'Paracetamol 500mg',
        brand: 'Crocin',
        categoryId: catMap['Medicines'] || categories[0].id,
        quantity: 20,
        unit: 'tablets',
        storageLocation: 'Medicine Cabinet',
        purchaseDate: daysOffset(-30),
        expiryDate: daysOffset(180), // Safe
        notes: 'For occasional headache or mild fever. Keep in dry place.'
      },
      {
        name: 'Moisturizing Face Sunscreen SPF 50',
        brand: 'La Roche-Posay',
        categoryId: catMap['Skincare'] || categories[0].id,
        quantity: 1,
        unit: 'tube',
        storageLocation: 'Bathroom',
        purchaseDate: daysOffset(-60),
        expiryDate: daysOffset(12), // Expiring Soon (12 days)
        notes: 'Apply every morning before going outdoors.',
        isFavorite: true
      },
      {
        name: 'Herbal Hair Shampoo',
        brand: 'Forest Essentials',
        categoryId: catMap['Personal Care'] || categories[0].id,
        quantity: 1,
        unit: 'bottle',
        storageLocation: 'Bathroom',
        purchaseDate: daysOffset(-45),
        expiryDate: daysOffset(50), // Safe
        notes: 'Gentle daily cleanser.'
      },
      {
        name: 'Extra Virgin Olive Oil 1L',
        brand: 'Borges',
        categoryId: catMap['Food'] || categories[0].id,
        quantity: 1,
        unit: 'bottle',
        storageLocation: 'Kitchen',
        purchaseDate: daysOffset(-15),
        expiryDate: daysOffset(220), // Safe
        notes: 'Keep in dark cupboard away from direct sunlight.'
      },
      {
        name: 'Greek Blueberry Yogurt',
        brand: 'Chobani',
        categoryId: catMap['Dairy Products'] || categories[0].id,
        quantity: 4,
        unit: 'cups',
        storageLocation: 'Refrigerator',
        purchaseDate: daysOffset(-3),
        expiryDate: daysOffset(4), // Expiring Soon (4 days)
        notes: 'Healthy snack with high protein.',
        isFavorite: true
      },
      {
        name: 'Disinfectant Multi-Surface Spray',
        brand: 'Lysol',
        categoryId: catMap['Cleaning Products'] || categories[0].id,
        quantity: 2,
        unit: 'bottles',
        storageLocation: 'Storage Room',
        purchaseDate: daysOffset(-90),
        expiryDate: daysOffset(300), // Safe
        notes: 'For kitchen countertops and tile cleaning.'
      },
      {
        name: 'Orange Juice 100% Pure',
        brand: 'Tropicana',
        categoryId: catMap['Beverages'] || categories[0].id,
        quantity: 1,
        unit: 'carton',
        storageLocation: 'Refrigerator',
        purchaseDate: daysOffset(-10),
        expiryDate: daysOffset(-3), // Expired 3 days ago
        notes: 'Needs to be disposed of.'
      },
      {
        name: 'Gentle Baby Moisturizing Cream',
        brand: 'Aveeno Baby',
        categoryId: catMap['Baby Products'] || categories[0].id,
        quantity: 1,
        unit: 'tube',
        storageLocation: 'Bedroom',
        purchaseDate: daysOffset(-40),
        expiryDate: daysOffset(75), // Safe
        notes: 'Dermatologist tested, fragrance-free.'
      },
      {
        name: 'Vitamin C 1000mg Effervescent',
        brand: 'Fast&Up',
        categoryId: catMap['Medicines'] || categories[0].id,
        quantity: 20,
        unit: 'tablets',
        storageLocation: 'Kitchen',
        purchaseDate: daysOffset(-20),
        expiryDate: daysOffset(22), // Expiring Soon (22 days)
        notes: 'Dissolve in glass of cold water.'
      }
    ];

    for (const prod of sampleProducts) {
      await prisma.product.create({
        data: {
          ...prod,
          userId: demoUser.id
        }
      });
    }

    // Add activity log
    await prisma.activityLog.create({
      data: {
        userId: demoUser.id,
        action: 'SETUP',
        details: 'Initial personal pantry and cabinet items added.'
      }
    });

    // Add initial notifications
    await prisma.notification.createMany({
      data: [
        {
          userId: demoUser.id,
          title: 'Item Expiring Today',
          message: 'Your Whole Wheat Sandwich Bread expires today!',
          type: 'EXPIRING_TODAY',
          daysRemaining: 0,
          isRead: false
        },
        {
          userId: demoUser.id,
          title: 'Expiring Soon Reminder',
          message: 'Whole Milk 1L expires in 2 days.',
          type: 'EXPIRING_SOON',
          daysRemaining: 2,
          isRead: false
        },
        {
          userId: demoUser.id,
          title: 'Expired Item Alert',
          message: 'Fresh Strawberries expired 1 day ago.',
          type: 'EXPIRED',
          daysRemaining: -1,
          isRead: true
        }
      ]
    });

    console.log('Sample products and notifications seeded successfully!');
  } else {
    console.log('Sample products already present for demo user.');
  }

  console.log('Seeding completed successfully!');
}

seed()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
