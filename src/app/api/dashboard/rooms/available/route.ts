// app/api/dashboard/rooms/available/route.ts
import { NextRequest, NextResponse } from 'next/server';
import getPool from '@/library/db';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    // Secure the endpoint
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token || !jwt.verify(token, process.env.JWT_SECRET!)) {
        return NextResponse.json({ message: 'Authentication required.' }, { status: 401 });
    }

    const pool = getPool();
    // The query specifically selects available rooms for dropdowns
    const query = "SELECT id, room_number FROM rooms WHERE status = 'Available' ORDER BY room_number ASC";
    const [rows] = await pool.query(query);
    
    return NextResponse.json(rows);

  } catch (error) {
    console.error('API GET /api/rooms/available Error:', error);
    return NextResponse.json({ message: 'Failed to fetch available rooms.' }, { status: 500 });
  }
}