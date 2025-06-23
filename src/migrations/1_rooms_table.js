// create_rooms_table.js
// A simple script to create the 'rooms' table in your database.

const mysql = require('mysql2/promise');

// --- Main Configuration ---
// IMPORTANT: Update the database name and your password if you have one.
const dbConfig = {
    host: '127.0.0.1',
    user: 'root',
    password: '', // <-- Update your root password here if needed
    database: 'boardsuite_management_system', // <-- The name of your database
};

// The SQL statement to create the 'rooms' table with a robust schema.
const createTableQuery = `
CREATE TABLE IF NOT EXISTS rooms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_number VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    capacity TINYINT UNSIGNED NOT NULL DEFAULT 1,
    status ENUM('Available', 'Occupied', 'Under Maintenance') NOT NULL DEFAULT 'Available',
    rate_per_month DECIMAL(10, 2) NOT NULL,
    -- Column to link to the 'users' table
    user_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    -- The foreign key constraint with cascade delete
    CONSTRAINT fk_room_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);
`;

/**
 * Main function to connect to the database and create the table.
 */
async function createRoomsTable() {
    let connection;
    try {
        // Establish the database connection using the config above
        console.log(`Connecting to database '${dbConfig.database}'...`);
        connection = await mysql.createConnection(dbConfig);
        console.log('Successfully connected.');

        // Execute the SQL query to create the table
        console.log('Attempting to create "rooms" table...');
        await connection.execute(createTableQuery);
        console.log('✅ SUCCESS! "rooms" table is ready.');

    } catch (error) {
        // Handle potential errors, such as connection issues or invalid SQL
        console.error('❌ ERROR creating the rooms table:', error.message);
        if (error.code === 'ER_BAD_DB_ERROR') {
            console.error(`Hint: Make sure the database '${dbConfig.database}' exists before running this script.`);
        }
    } finally {
        // Always close the connection, whether the query succeeded or failed
        if (connection) {
            await connection.end();
            console.log('Database connection closed.');
        }
    }
}

// Run the main function
createRoomsTable();
