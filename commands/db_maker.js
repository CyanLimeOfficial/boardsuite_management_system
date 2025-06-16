// THIS FILE CAN CREATE OR DELETE THE DATABASE, TABLE, OR USER CREDENTIALS

const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

// --- Main Configuration ---
const DBNAME = 'boardsuite_management_system';
const TABLENAME = 'users';
const newUser = {
    username: 'admin',
    password: 'admin',
    fullName: 'Administrator',
};

// --- Database Connection Config ---
const dbConfig = {
    host: '127.0.0.1',
    user: 'root',
    password: '', // <-- IMPORTANT: Update your root password here if you have one
};

// --------------------------------------------------------------------------------------
// SCRIPT LOGIC - NO NEED TO EDIT BELOW THIS LINE
// --------------------------------------------------------------------------------------

/**
 * Parses command line arguments in the format --key=value
 * @returns {object} An object containing the parsed arguments.
 */
function parseArgs() {
    const args = {};
    process.argv.slice(2).forEach(arg => {
        if (arg.startsWith('--')) {
            const [key, value] = arg.substring(2).split('=');
            args[key] = value;
        }
    });
    return args;
}

/**
 * The main function that decides which action to take.
 */
async function main() {
    const args = parseArgs();

    if (args.delete === 'db') {
        await deleteDatabase();
    } else if (args.delete === 'table') {
        await deleteTable();
    } else if (args.delete === 'cred') {
        // NOTE: This deletes the user specified in the `newUser` constant above.
        await deleteUser(newUser.username);
    } else {
        // Default action: setup everything if no valid flags are provided
        await setupDatabaseAndCreateUser();
    }
}

/**
 * ACTION: Sets up the database, table, and user.
 */
async function setupDatabaseAndCreateUser() {
    let connection;
    try {
        console.log('Connecting to the MySQL server...');
        connection = await mysql.createConnection(dbConfig);
        console.log(`Ensuring database '${DBNAME}' exists...`);
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DBNAME}\`;`);
        await connection.query(`USE \`${DBNAME}\`;`);
        console.log(`Database '${DBNAME}' is ready.`);

        const createTableQuery = `CREATE TABLE IF NOT EXISTS \`${TABLENAME}\` (id INT AUTO_INCREMENT PRIMARY KEY, username VARCHAR(50) NOT NULL UNIQUE, password VARCHAR(255) NOT NULL, full_name VARCHAR(255), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);`;
        console.log(`Ensuring '${TABLENAME}' table exists...`);
        await connection.query(createTableQuery);
        console.log(`'${TABLENAME}' table is ready.`);

        console.log(`Hashing password: ${newUser.password}`);
        const hashedPassword = await bcrypt.hash(newUser.password, saltRounds = 10);
        console.log('Password hashed successfully.');

        console.log(`Inserting user '${newUser.username}'...`);
        const insertQuery = `INSERT INTO \`${TABLENAME}\` (username, password, full_name) VALUES (?, ?, ?)`;
        await connection.execute(insertQuery, [newUser.username, hashedPassword, newUser.fullName]);

        console.log(`\n✅ SUCCESS! User '${newUser.username}' was created in table '${TABLENAME}'.`);
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            console.error(`\n❌ INFO: The user '${newUser.username}' already exists. No changes made.`);
        } else {
            console.error('\n❌ An error occurred during setup:', error.message);
        }
    } finally {
        if (connection) await connection.end();
    }
}

/**
 * ACTION: Deletes the entire database.
 */
async function deleteDatabase() {
    let connection;
    try {
        console.log('Connecting to the MySQL server...');
        connection = await mysql.createConnection(dbConfig);
        console.log(`Attempting to delete database: '${DBNAME}'...`);
        await connection.query(`DROP DATABASE IF EXISTS \`${DBNAME}\`;`);
        console.log(`\n✅ SUCCESS! Database '${DBNAME}' was deleted.`);
    } catch (error) {
        console.error('\n❌ An error occurred while deleting the database:', error.message);
    } finally {
        if (connection) await connection.end();
    }
}

/**
 * ACTION: Deletes the user table.
 */
async function deleteTable() {
    let connection;
    try {
        const dbWithDbName = { ...dbConfig, database: DBNAME };
        console.log(`Connecting to database '${DBNAME}'...`);
        connection = await mysql.createConnection(dbWithDbName);
        console.log(`Attempting to delete table: '${TABLENAME}'...`);
        await connection.query(`DROP TABLE IF EXISTS \`${TABLENAME}\`;`);
        console.log(`\n✅ SUCCESS! Table '${TABLENAME}' was deleted from database '${DBNAME}'.`);
    } catch (error) {
        // Handle case where the database itself doesn't exist
        if (error.code === 'ER_BAD_DB_ERROR') {
             console.error(`\n❌ ERROR: Cannot delete table because database '${DBNAME}' does not exist.`);
        } else {
            console.error('\n❌ An error occurred while deleting the table:', error.message);
        }
    } finally {
        if (connection) await connection.end();
    }
}

/**
 * ACTION: Deletes a specific user credential from the table.
 * @param {string} username The username to delete.
 */
async function deleteUser(username) {
    let connection;
    try {
        const dbWithDbName = { ...dbConfig, database: DBNAME };
        console.log(`Connecting to database '${DBNAME}'...`);
        connection = await mysql.createConnection(dbWithDbName);
        console.log(`Attempting to delete user: '${username}'...`);
        const [result] = await connection.execute(`DELETE FROM \`${TABLENAME}\` WHERE username = ?;`, [username]);
        
        if (result.affectedRows > 0) {
            console.log(`\n✅ SUCCESS! User '${username}' was deleted.`);
        } else {
            console.log(`\nℹ️ INFO: User '${username}' not found. No changes made.`);
        }
    } catch (error) {
        if (error.code === 'ER_BAD_DB_ERROR') {
             console.error(`\n❌ ERROR: Cannot delete user because database '${DBNAME}' does not exist.`);
        } else if (error.code === 'ER_NO_SUCH_TABLE') {
            console.error(`\n❌ ERROR: Cannot delete user because table '${TABLENAME}' does not exist.`);
        } else {
            console.error('\n❌ An error occurred while deleting the user:', error.message);
        }
    } finally {
        if (connection) await connection.end();
    }
}


// --- Run the main script logic ---
main();