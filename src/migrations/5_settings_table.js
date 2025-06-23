// src/migrations/create_settings_table.js
// This script creates the 'settings' table and initializes it with a default row.

const mysql = require('mysql2/promise');

// --- Main Configuration ---
const dbConfig = {
    host: '127.0.0.1',
    user: 'root',
    password: '', // <-- Update your root password here if needed
    database: 'boardsuite_management_system', // <-- The name of your database
};

// The SQL statement to create the 'settings' table.
const createTableQuery = `
CREATE TABLE IF NOT EXISTS settings (
    id INT PRIMARY KEY DEFAULT 1, -- Enforces a single row for settings
    user_id INT NULL, -- The user who owns/manages these settings

    -- 1. General & Business Information
    boarding_house_name VARCHAR(255) DEFAULT 'My Boarding House',
    business_address TEXT,
    contact_phone VARCHAR(50),
    contact_email VARCHAR(255),
    currency_symbol VARCHAR(10) DEFAULT '₱',

    -- 2. Billing & Financial Settings
    default_due_period INT DEFAULT 15, -- Days until a bill is due
    late_fees_enabled BOOLEAN DEFAULT FALSE,
    late_fee_type ENUM('Fixed', 'Percentage') DEFAULT 'Fixed',
    late_fee_amount DECIMAL(10, 2) DEFAULT 0.00,
    payment_methods JSON, -- Stores a list like ["Cash", "GCash"]

    -- 3. API & Integration Settings
    gemini_api_key VARCHAR(255), -- IMPORTANT: Store encrypted in a real application

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Ensures only one row can ever exist
    CONSTRAINT single_row CHECK (id = 1),
    
    -- Connects settings to a user. If the user is deleted, the settings remain but are unlinked.
    CONSTRAINT fk_settings_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE SET NULL
);
`;

// A query to insert the default settings row linked to user 1, if it doesn't exist.
const insertDefaultRowQuery = `
    INSERT IGNORE INTO settings (id, user_id) VALUES (1, 1);
`;

/**
 * Main function to connect to the database and create the table.
 */
async function createSettingsTable() {
    let connection;
    try {
        // Establish the database connection
        console.log(`Connecting to database '${dbConfig.database}'...`);
        connection = await mysql.createConnection(dbConfig);
        console.log('Successfully connected.');

        // Execute the SQL query to create the table
        console.log('Attempting to create "settings" table...');
        await connection.execute(createTableQuery);
        console.log('✅ SUCCESS! "settings" table is ready.');

        // Insert the single, default row linked to user_id 1
        console.log('Attempting to insert default settings row for user 1...');
        await connection.execute(insertDefaultRowQuery);
        console.log('✅ SUCCESS! Default settings row initialized.');

    } catch (error) {
        // Handle potential errors
        console.error('❌ ERROR creating the settings table:', error.message);
        if (error.code === 'ER_BAD_DB_ERROR') {
            console.error(`Hint: Make sure the database '${dbConfig.database}' exists before running this script.`);
        }
    } finally {
        // Always close the connection
        if (connection) {
            await connection.end();
            console.log('Database connection closed.');
        }
    }
}

// Run the main function
createSettingsTable();
