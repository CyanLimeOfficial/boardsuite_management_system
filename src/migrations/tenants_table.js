// src/migrations/create_tenants_table.js
// A simple script to create the 'tenants' table.

const mysql = require('mysql2/promise');

// IMPORTANT: Update your database configuration here.
const dbConfig = {
    host: '127.0.0.1',
    user: 'root',
    password: '', // <-- Update your root password if needed
    database: 'boardsuite_management_system',
};

// The SQL command to create the tenants table
const createTableQuery = `
    CREATE TABLE IF NOT EXISTS tenants (
        id INT AUTO_INCREMENT PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        contact_number VARCHAR(20) NULL,
        email VARCHAR(255) UNIQUE NULL,
        address TEXT NULL,
        emergency_contact_name VARCHAR(255) NULL,
        emergency_contact_number VARCHAR(20) NULL,
        -- Column to link to the 'rooms' table
        room_id INT UNIQUE,
        registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        -- The foreign key constraint with ON DELETE SET NULL
        CONSTRAINT fk_tenant_room
            FOREIGN KEY (room_id)
            REFERENCES rooms(id)
            ON DELETE SET NULL
    );
`;

/**
 * Main function to connect and create the table.
 */
async function createTenantsTable() {
    let connection;
    try {
        console.log(`Connecting to database '${dbConfig.database}'...`);
        connection = await mysql.createConnection(dbConfig);
        console.log('Successfully connected.');

        console.log('Attempting to create "tenants" table...');
        await connection.execute(createTableQuery);
        console.log('✅ SUCCESS! "tenants" table is ready.');

    } catch (error) {
        console.error('❌ ERROR creating the tenants table:', error.message);
    } finally {
        if (connection) {
            await connection.end();
            console.log('Database connection closed.');
        }
    }
}

// Run the function
createTenantsTable();
