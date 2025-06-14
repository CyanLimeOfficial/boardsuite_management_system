

import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

// Define the database connection configuration using environment variables
const dbConfig = {
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
};

export async function POST(request: Request) {
  const { username, password } = await request.json();

  if (!username || !password) {
    return NextResponse.json({ message: 'Username and password are required.' }, { status: 400 });
  }

  let connection;
  try {
    // Establish a connection to the MySQL database
    connection = await mysql.createConnection(dbConfig);

    // Find the user by their username
    const query = 'SELECT * FROM user WHERE username = ?';
    const [rows] = await connection.execute(query, [username]);

    // If no user is found, return an error
    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ message: 'Invalid username or password.' }, { status: 401 });
    }

    const user = rows[0] as any;

    // Compare the provided password with the hashed password stored in the database
    const passwordIsValid = await bcrypt.compare(password, user.password);

    if (!passwordIsValid) {
      return NextResponse.json({ message: 'Invalid username or password.' }, { status: 401 });
    }

    // On successful authentication, return a success response
    // In a real app, you would generate a JWT or session token here
    return NextResponse.json({
      message: 'Login successful!',
      user: { id: user.id, username: user.username, fullName: user.full_name }
    });

  } catch (error) {
    console.error('Login API Error:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  } finally {
    // Always close the database connection
    if (connection) {
      await connection.end();
    }
  }
}