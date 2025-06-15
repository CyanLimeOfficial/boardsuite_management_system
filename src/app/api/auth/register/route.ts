// app/api/auth/register/route.ts
import { NextResponse } from 'next/server';
import getPool from '@/library/db';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    // --- FIX: Expect username, password, and full_name ---
    const { username, password, full_name } = await request.json();

    if (!username || !password || !full_name) {
      return NextResponse.json({ message: 'Username, password, and full name are required.' }, { status: 400 });
    }

    const pool = getPool();
    
    // --- FIX: Check if the username already exists ---
    const [existingUser] = await pool.query('SELECT id FROM users WHERE username = ?', [username]);
    if ((existingUser as any[]).length > 0) {
      return NextResponse.json({ message: 'This username is already taken.' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // --- FIX: Insert the correct fields (username, password, full_name) into the database ---
    await pool.query(
      'INSERT INTO users (username, password, full_name) VALUES (?, ?, ?)', 
      [username, hashedPassword, full_name]
    );

    return NextResponse.json({ message: 'User registered successfully.' }, { status: 201 });
  } catch (error) {
    console.error('REGISTRATION ERROR:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}