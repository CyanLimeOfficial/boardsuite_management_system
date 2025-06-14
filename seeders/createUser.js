// File: createUser.js

const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

// --- IMPORTANT: Fill in your user details here ---
const newUser = {
  username: 'admin', // The username for the new user
  password: 'admin', // The plain-text password you want to use
  fullName: 'Administrator', // The user's full name
};
// ----------------------------------------------------

// Database configuration (should match your .env.local file)
const dbConfig = {
  host: '127.0.0.1',
  user: 'root', // <-- Change this
  password: '', // <-- Change this
  database: 'boardsuite_management_system',
};

async function createAdminUser() {
  console.log('Connecting to the database...');
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    // Hash the plain-text password
    console.log(`Hashing password: ${newUser.password}`);
    const saltRounds = 10; // Standard number of salt rounds for bcrypt
    const hashedPassword = await bcrypt.hash(newUser.password, saltRounds);
    console.log('Password hashed successfully.');

    // Insert the new user into the 'users' table with the hashed password
    const query = 'INSERT INTO users (username, password, full_name) VALUES (?, ?, ?)';
    await connection.execute(query, [newUser.username, hashedPassword, newUser.fullName]);
    
    console.log(`\nSUCCESS! User '${newUser.username}' created successfully.`);
    console.log(`You can now log in with username '${newUser.username}' and password '${newUser.password}'.`);

  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      console.error(`\nERROR: A user with the username '${newUser.username}' already exists.`);
    } else {
      console.error('\nAn error occurred:', error);
    }
  } finally {
    // Always close the connection
    await connection.end();
    console.log('Database connection closed.');
  }
}

createAdminUser();