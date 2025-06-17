// app/api/rooms/available/route.ts
import { NextResponse } from 'next/server';
import getPool from '@/library/db';

/**
 * This dedicated endpoint ONLY fetches available rooms
 * for use in dropdown menus.
 */
export async function GET() {
  try {
    const pool = getPool();
    // The query only selects the 'id' and 'room_number' for efficiency.
    const query = "SELECT id, room_number FROM rooms WHERE status = 'Available' ORDER BY room_number ASC";
    const [rows] = await pool.query(query);
    return NextResponse.json(rows);
  } catch (error) {
    console.error('API GET /api/rooms/available Error:', error);
    return NextResponse.json({ message: 'Failed to fetch available rooms.' }, { status: 500 });
  }
}
