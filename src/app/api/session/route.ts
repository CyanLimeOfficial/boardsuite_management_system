// app/api/users/me/route.ts
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import jwt from 'jsonwebtoken';

// This is the shape of the data inside our JWT
interface UserJwtPayload {
  id: number;
  username: string;
  fullName: string;
}

export async function GET() {
  try {
    // --- THIS IS THE FIX ---
    // 1. Correctly get the headers object first by using await
    const headersList = await headers();
    // 2. Now you can safely call .get() on the resolved object
    const authHeader = headersList.get('authorization');
    // ----------------------

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.substring(7); // Remove "Bearer "

    // Verify the token using your secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as UserJwtPayload;

    // If token is valid, return the user's data from the token's payload
    return NextResponse.json({
      id: decoded.id,
      username: decoded.username,
      full_name: decoded.fullName,
    });

  } catch (error) {
    // This catches errors from jwt.verify (e.g., invalid signature, expired token)
    return NextResponse.json({ message: 'Unauthorized: Invalid or expired token.' }, { status: 401 });
  }
}