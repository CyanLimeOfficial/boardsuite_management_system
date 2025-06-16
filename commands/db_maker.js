// THIS SCRIPT CAN CREATE OR DELETE SPECIFIC PARTS OF THE DATABASE SETUP.

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
 * Parses command line arguments. Handles both --key=value and --flag formats.
 * @returns {object} An object containing the parsed arguments.
 */
function parseArgs() {
    const args = {};
    process.argv.slice(2).forEach(arg => {
        if (arg.startsWith('--')) {
            const argWithoutDashes = arg.substring(2);
            const [key, value] = argWithoutDashes.split('=');
            // If there's no value, treat it as a boolean flag (e.g., --help)
            args[key] = value === undefined ? true : value;
        }
    });
    return args;
}

/**
 * Displays the help/usage message.
 */
function showUsage() {
    console.log(`
    Usage: node commands/db_maker.js [command]

    Commands:
      --help            Shows this help message.

      --create=all      Creates the database, the table, and the admin user.
      --create=db       Creates only the database.
      --create=table    Creates only the table (database must exist).
      --create=cred     Creates only the admin user (db and table must exist).

      --delete=db       Deletes the entire database.
      --delete=table    Deletes the user table.
      --delete=cred     Deletes the admin user credential.
    `);
}


/**
 * The main function that decides which action to take.
 */
async function main() {
    const args = parseArgs();

    // Check for the --help flag first. This has top priority.
    if (args.help) {
        return showUsage();
    }

    if (args.create) {
        switch (args.create) {
            case 'all': return await setupAll();
            case 'db': return await createDb();
            case 'table': return await createTable();
            case 'cred': return await createUser(newUser);
            default: showUsage();
        }
    } else if (args.delete) {
        switch (args.delete) {
            case 'db': return await deleteDatabase();
            case 'table': return await deleteTable();
            case 'cred': return await deleteUser(newUser.username);
            default: showUsage();
        }
    } else {
        // Default action if no valid arguments are given
        showUsage();
    }
}


// --- ATOMIC CREATE FUNCTIONS ---

async function createDb() {
    let connection;
    try {
        console.log('Connecting to the MySQL server...');
        connection = await mysql.createConnection(dbConfig);
        console.log(`Attempting to create database: '${DBNAME}'...`);
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DBNAME}\`;`);
        console.log(`\n✅ SUCCESS! Database '${DBNAME}' is ready.`);
    } catch (error) {
        console.error('\n❌ An error occurred:', error.message);
    } finally {
        if (connection) await connection.end();
    }
}

async function createTable() {
    let connection;
    try {
        const dbWithDbName = { ...dbConfig, database: DBNAME };
        console.log(`Connecting to database '${DBNAME}'...`);
        connection = await mysql.createConnection(dbWithDbName);
        const createTableQuery = `CREATE TABLE IF NOT EXISTS \`${TABLENAME}\` (id INT AUTO_INCREMENT PRIMARY KEY, username VARCHAR(50) NOT NULL UNIQUE, password VARCHAR(255) NOT NULL, full_name VARCHAR(255), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);`;
        console.log(`Attempting to create table: '${TABLENAME}'...`);
        await connection.query(createTableQuery);
        console.log(`\n✅ SUCCESS! Table '${TABLENAME}' is ready.`);
    } catch (error) {
        if (error.code === 'ER_BAD_DB_ERROR') {
             console.error(`\n❌ ERROR: Cannot create table because database '${DBNAME}' does not exist. Run --create=db first.`);
        } else {
            console.error('\n❌ An error occurred:', error.message);
        }
    } finally {
        if (connection) await connection.end();
    }
}

async function createUser(user) {
    let connection;
    try {
        const dbWithDbName = { ...dbConfig, database: DBNAME };
        console.log(`Connecting to database '${DBNAME}'...`);
        connection = await mysql.createConnection(dbWithDbName);
        console.log(`Hashing password for user: ${user.username}`);
        const hashedPassword = await bcrypt.hash(user.password, 10);
        console.log(`Attempting to insert user: '${user.username}'...`);
        const insertQuery = `INSERT INTO \`${TABLENAME}\` (username, password, full_name) VALUES (?, ?, ?)`;
        await connection.execute(insertQuery, [user.username, hashedPassword, user.fullName]);
        console.log(`\n✅ SUCCESS! User '${user.username}' was created.`);
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            console.error(`\n❌ INFO: The user '${user.username}' already exists.`);
        } else if (error.code === 'ER_BAD_DB_ERROR' || error.code === 'ER_NO_SUCH_TABLE') {
             console.error(`\n❌ ERROR: Database or table does not exist. Run --create=all or --create=table first.`);
        } else {
            console.error('\n❌ An error occurred:', error.message);
        }
    } finally {
        if (connection) await connection.end();
    }
}

async function setupAll() {
    console.log("--- Starting full setup: DB -> Table -> User ---");
    await createDb();
    await createTable();
    await createUser(newUser);
    console.log("\n--- Full setup complete! ---");
}


// --- ATOMIC DELETE FUNCTIONS (Unchanged) ---

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
        if (error.code === 'ER_BAD_DB_ERROR') {
             console.error(`\n❌ ERROR: Cannot delete table because database '${DBNAME}' does not exist.`);
        } else {
            console.error('\n❌ An error occurred while deleting the table:', error.message);
        }
    } finally {
        if (connection) await connection.end();
    }
}

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
        if (error.code === 'ER_BAD_DB_ERROR' || error.code === 'ER_NO_SUCH_TABLE') {
             console.error(`\n❌ ERROR: Database or table does not exist.`);
        } else {
            console.error('\n❌ An error occurred while deleting the user:', error.message);
        }
    } finally {
        if (connection) await connection.end();
    }
}


// --- Run the main script logic ---
main();