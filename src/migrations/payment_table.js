// src/migrations/create_payments_table.js
// A script to create the 'payments' table for logging all transactions.

const mysql = require('mysql2/promise');

// IMPORTANT: Update your database configuration here.
const dbConfig = {
    host: '127.0.0.1',
    user: 'root',
    password: '', // <-- Update your root password if needed
    database: 'boardsuite_management_system',
};

// The SQL statement to create the 'payments' table.
const createTableQuery = `
CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bill_id INT NOT NULL,
    tenant_id INT NOT NULL,
    user_id INT NOT NULL, -- The user/admin who recorded the payment

    amount_paid DECIMAL(10, 2) NOT NULL,
    payment_date DATE NOT NULL,
    payment_method ENUM('Cash', 'Bank Transfer', 'GCash', 'Card', 'Other') NOT NULL,

    notes TEXT NULL, -- Optional notes for the transaction (e.g., reference number)
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Foreign key constraints
    CONSTRAINT fk_payment_bill FOREIGN KEY (bill_id) REFERENCES bills(id) ON DELETE CASCADE,
    CONSTRAINT fk_payment_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    CONSTRAINT fk_payment_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
`;

/**
 * Main function to connect to the database and create the payments table.
 */
async function createPaymentsTable() {
    let connection;
    try {
        console.log(`Connecting to database '${dbConfig.database}'...`);
        connection = await mysql.createConnection(dbConfig);
        console.log('Successfully connected.');

        console.log('Attempting to create "payments" table...');
        await connection.execute(createTableQuery);
        console.log('✅ SUCCESS! "payments" table is ready for transaction history.');

    } catch (error) {
        console.error('❌ ERROR creating the payments table:', error.message);
    } finally {
        if (connection) {
            await connection.end();
            console.log('Database connection closed.');
        }
    }
}

// Run these scripts after creating the 'users', 'rooms', and 'tenants' tables
createPaymentsTable();
