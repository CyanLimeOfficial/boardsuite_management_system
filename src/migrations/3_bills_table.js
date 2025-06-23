// src/migrations/create_bills_table.js
// A script to create the 'bills' table for tracking monthly invoices.

const mysql = require('mysql2/promise');

// IMPORTANT: Update your database configuration here.
const dbConfig = {
    host: '127.0.0.1',
    user: 'root',
    password: '', // <-- Update your root password if needed
    database: 'boardsuite_management_system',
};

// The SQL statement to create the 'bills' table.
const createTableQuery = `
CREATE TABLE IF NOT EXISTS bills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tenant_id INT NOT NULL,
    room_id INT NOT NULL,
    user_id INT NOT NULL, -- The user/admin who generated the bill
    
    amount_due DECIMAL(10, 2) NOT NULL,
    bill_date DATE NOT NULL, -- The date the bill is issued for (e.g., '2025-07-01')
    due_date DATE NOT NULL,
    
    status ENUM('Pending', 'Paid', 'Partially Paid', 'Overdue') NOT NULL DEFAULT 'Pending',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Foreign key constraints
    CONSTRAINT fk_bill_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    CONSTRAINT fk_bill_room FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
    CONSTRAINT fk_bill_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
`;

/**
 * Main function to connect to the database and create the bills table.
 */
async function createBillsTable() {
    let connection;
    try {
        console.log(`Connecting to database '${dbConfig.database}'...`);
        connection = await mysql.createConnection(dbConfig);
        console.log('Successfully connected.');

        console.log('Attempting to create "bills" table...');
        await connection.execute(createTableQuery);
        console.log('✅ SUCCESS! "bills" table is ready for invoicing.');

    } catch (error) {
        console.error('❌ ERROR creating the bills table:', error.message);
    } finally {
        if (connection) {
            await connection.end();
            console.log('Database connection closed.');
        }
    }
}

// Run the function
createBillsTable();
