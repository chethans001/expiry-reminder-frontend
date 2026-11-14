const mysql = require('mysql2/promise');

async function createTables() {
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'expiry_db',
    port: 3306
  });

  console.log('Connected to expiry_db. Creating tables...');

  // Users table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(191) NOT NULL,
      email VARCHAR(191) NOT NULL UNIQUE,
      password VARCHAR(191) NOT NULL,
      avatar VARCHAR(191) NULL,
      resetPasswordToken VARCHAR(191) NULL,
      resetPasswordExpires DATETIME(3) NULL,
      createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // Categories table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS categories (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(191) NOT NULL,
      icon VARCHAR(191) NOT NULL DEFAULT 'Tag',
      color VARCHAR(191) NOT NULL DEFAULT '#6366F1',
      isDefault BOOLEAN NOT NULL DEFAULT FALSE,
      userId INT NULL,
      createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
      INDEX (userId)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // Products table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS products (
      id INT AUTO_INCREMENT PRIMARY KEY,
      userId INT NOT NULL,
      categoryId INT NOT NULL,
      name VARCHAR(191) NOT NULL,
      brand VARCHAR(191) NULL,
      imageUrl VARCHAR(191) NULL,
      quantity DOUBLE NOT NULL DEFAULT 1,
      unit VARCHAR(191) NOT NULL DEFAULT 'pcs',
      purchaseDate DATETIME(3) NULL,
      manufacturingDate DATETIME(3) NULL,
      expiryDate DATETIME(3) NOT NULL,
      storageLocation VARCHAR(191) NOT NULL DEFAULT 'Kitchen',
      notes TEXT NULL,
      isFavorite BOOLEAN NOT NULL DEFAULT FALSE,
      isDeleted BOOLEAN NOT NULL DEFAULT FALSE,
      deletedAt DATETIME(3) NULL,
      useCount INT NOT NULL DEFAULT 0,
      createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (categoryId) REFERENCES categories(id) ON DELETE RESTRICT,
      INDEX (userId),
      INDEX (categoryId),
      INDEX (expiryDate),
      INDEX (isDeleted)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // Notifications table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      userId INT NOT NULL,
      productId INT NULL,
      title VARCHAR(191) NOT NULL,
      message VARCHAR(191) NOT NULL,
      type VARCHAR(191) NOT NULL DEFAULT 'EXPIRING_SOON',
      daysRemaining INT NULL,
      isRead BOOLEAN NOT NULL DEFAULT FALSE,
      sentEmail BOOLEAN NOT NULL DEFAULT FALSE,
      createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE,
      INDEX (userId),
      INDEX (productId),
      INDEX (isRead)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // Notification Preferences table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS notification_preferences (
      id INT AUTO_INCREMENT PRIMARY KEY,
      userId INT NOT NULL UNIQUE,
      emailNotifications BOOLEAN NOT NULL DEFAULT TRUE,
      inAppNotifications BOOLEAN NOT NULL DEFAULT TRUE,
      notify30Days BOOLEAN NOT NULL DEFAULT TRUE,
      notify15Days BOOLEAN NOT NULL DEFAULT TRUE,
      notify7Days BOOLEAN NOT NULL DEFAULT TRUE,
      notify3Days BOOLEAN NOT NULL DEFAULT TRUE,
      notify1Day BOOLEAN NOT NULL DEFAULT TRUE,
      notifyOnExpiry BOOLEAN NOT NULL DEFAULT TRUE,
      notifyAfterExpiry BOOLEAN NOT NULL DEFAULT TRUE,
      createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // Activity Logs table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS activity_logs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      userId INT NOT NULL,
      productId INT NULL,
      action VARCHAR(191) NOT NULL,
      details TEXT NULL,
      createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (productId) REFERENCES products(id) ON DELETE SET NULL,
      INDEX (userId),
      INDEX (productId)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  console.log('All MySQL tables created successfully!');
  await connection.end();
}

createTables().catch(console.error);
