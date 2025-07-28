const db = require('./db');

async function initializeDatabase() {
  try {
    console.log('Starting database initialization...');

    // Create Users table
    await db.query(`
      CREATE TABLE IF NOT EXISTS Users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('gamer', 'seller') NOT NULL DEFAULT 'gamer',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Users table created/verified');

    // Create Sellers table
    await db.query(`
      CREATE TABLE IF NOT EXISTS Sellers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        companyName VARCHAR(255) NOT NULL,
        contactPhone VARCHAR(20) NOT NULL,
        address TEXT NOT NULL,
        gamesListed INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
      )
    `);
    console.log('✓ Sellers table created/verified');

    // Create Games table
    await db.query(`
      CREATE TABLE IF NOT EXISTS Games (
        id INT AUTO_INCREMENT PRIMARY KEY,
        seller_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        genre VARCHAR(100) NOT NULL,
        release_date DATE,
        price DECIMAL(10, 2) DEFAULT 0.00,
        description TEXT,
        image_url VARCHAR(500),
        stock_quantity INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (seller_id) REFERENCES Users(id) ON DELETE CASCADE
      )
    `);
    console.log('✓ Games table created/verified');

    // Create Cart table
    await db.query(`
      CREATE TABLE IF NOT EXISTS Cart (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        game_id INT NOT NULL,
        quantity INT NOT NULL DEFAULT 1,
        added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
        FOREIGN KEY (game_id) REFERENCES Games(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_game (user_id, game_id)
      )
    `);
    console.log('✓ Cart table created/verified');

    // Create Orders table (for future use)
    await db.query(`
      CREATE TABLE IF NOT EXISTS Orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        total_amount DECIMAL(10, 2) NOT NULL,
        status ENUM('pending', 'confirmed', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
        shipping_address TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
      )
    `);
    console.log('✓ Orders table created/verified');

    // Create Order_Items table (for future use)
    await db.query(`
      CREATE TABLE IF NOT EXISTS Order_Items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        game_id INT NOT NULL,
        quantity INT NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES Orders(id) ON DELETE CASCADE,
        FOREIGN KEY (game_id) REFERENCES Games(id) ON DELETE CASCADE
      )
    `);
    console.log('✓ Order_Items table created/verified');

    console.log('🎉 All database tables created/verified successfully!');
    return { success: true, message: 'Database initialized successfully' };

  } catch (error) {
    console.error('❌ Error creating database tables:', error);
    throw error;
  }
}

// Function to check if database connection is working
async function testDatabaseConnection() {
  try {
    const [rows] = await db.query('SELECT 1 as test');
    console.log('✓ Database connection test successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection test failed:', error);
    return false;
  }
}

module.exports = { 
  initializeDatabase,
  testDatabaseConnection
};