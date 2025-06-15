// app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import getPool from '@/library/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

interface User {
  id: number;
  username: string;
  password: string;
  full_name: string;
}

export async function POST(request: Request) {
  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET is not defined in the .env.local file.');
      throw new Error('Server configuration error.');
    }

    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ message: 'Username and password are required.' }, { status: 400 });
    }

    const pool = getPool();
    const query = 'SELECT * FROM users WHERE username = ?';
    const [rows] = await pool.execute(query, [username]);

    const users = rows as User[];
    if (users.length === 0) {
      return NextResponse.json({ message: 'Invalid username or password.' }, { status: 401 });
    }

    const user = users[0];
    const passwordIsValid = await bcrypt.compare(password, user.password);

    if (!passwordIsValid) {
      return NextResponse.json({ message: 'Invalid username or password.' }, { status: 401 });
    }

    const payload = {
      id: user.id,
      username: user.username,
      fullName: user.full_name,
    };

    const token = jwt.sign(payload, jwtSecret, { expiresIn: '1d' });

    return NextResponse.json({ token });

  } catch (error) {
    console.error('Login API Error:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}