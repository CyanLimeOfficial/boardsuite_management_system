// app/api/dashboard/rooms/route.ts
import { NextResponse } from 'next/server';
import getPool from '@/library/db';

/**
 * Handles GET requests to fetch all rooms.
 * This function will be called when your RoomsPage loads.
 */
export async function GET() {
  try {
    const pool = getPool();
    const query = 'SELECT * FROM rooms ORDER BY room_number ASC';
    const [rows] = await pool.query(query);

    return NextResponse.json(rows);

  } catch (error) {
    console.error('API GET /api/rooms Error:', error);
    return NextResponse.json({ message: 'Failed to fetch rooms.' }, { status: 500 });
  }
}

/**
 * Handles POST requests to create a new room.
 * This will be called when you submit the "Create New Room" form.
 */
export async function POST(request: Request) {
  try {
    const { room_number, description, capacity, rate_per_month } = await request.json();

    // Basic validation
    if (!room_number || !capacity || !rate_per_month) {
      return NextResponse.json({ message: 'Room number, capacity, and rate are required.' }, { status: 400 });
    }

    const pool = getPool();
    const query = `
      INSERT INTO rooms (room_number, description, capacity, rate_per_month) 
      VALUES (?, ?, ?, ?)
    `;
    const [result] = await pool.execute(query, [room_number, description, capacity, rate_per_month]);

    return NextResponse.json({ message: 'Room created successfully!', newRoomId: (result as any).insertId }, { status: 201 });

  } catch (error: any) {
    // Handle specific error for duplicate room numbers
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ message: `Room number "${error.value}" already exists.` }, { status: 409 });
    }

    console.error('API POST /api/rooms Error:', error);
    return NextResponse.json({ message: 'Failed to create room.' }, { status: 500 });
  }
}
