// app/api/dashboard/rooms/route.ts
import { NextRequest, NextResponse } from 'next/server';
import getPool from '@/library/db';
import jwt from 'jsonwebtoken';

interface UserJwtPayload {
  id: number;
}

// ... (Your GET function remains unchanged)
export async function GET() {
  try {
    const pool = getPool();
    const query = `
        SELECT r.*, t.full_name as occupant_name 
        FROM rooms r
        LEFT JOIN tenants t ON r.id = t.room_id
        ORDER BY r.room_number ASC
    `;
    const [rows] = await pool.query(query);

    return NextResponse.json(rows);

  } catch (error) {
    console.error('API GET /api/dashboard/rooms Error:', error);
    return NextResponse.json({ message: 'Failed to fetch rooms.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  console.log('\n--- [API] /api/dashboard/rooms POST request received ---'); // LOG 1

  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    console.log('[API] Token received:', token ? 'Yes' : 'No'); // LOG 2
    
    if (!token) {
        return NextResponse.json({ message: 'Authentication required.' }, { status: 401 });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as UserJwtPayload;
    const userId = decoded.id;
    console.log('[API] User ID from token:', userId); // LOG 3

    if (!userId) {
        return NextResponse.json({ message: 'Could not identify user from token.' }, { status: 403 });
    }

    const { room_number, description, capacity, rate_per_month} = await request.json();
    console.log('[API] Room data from request body:', { room_number, description, capacity, rate_per_month }); // LOG 4

    const pool = getPool();

    // --- The crucial part ---
    const query = `
      INSERT INTO rooms (room_number, description, capacity, rate_per_month, user_id) 
      VALUES (?, ?, ?, ?, ?)
    `;
    const queryParams = [room_number, description, capacity, rate_per_month, userId];

    console.log('[API] Preparing to execute SQL query...'); // LOG 5
    console.log('[API] Query String:', query.trim().replace(/\s+/g, ' ')); // LOG 6: Show the query
    console.log('[API] Query Parameters:', queryParams); // LOG 7: Show the parameters

    const [result] = await pool.execute(query, queryParams);
    
    console.log('[API] Query successful!'); // LOG 8

    return NextResponse.json({ message: 'Room created successfully!', newRoomId: (result as any).insertId }, { status: 201 });

  } catch (error: any) {
    console.error('[API] CRITICAL ERROR:', error); // LOG 9
    // ... (rest of the catch block is the same)
    if (error instanceof jwt.JsonWebTokenError) { /* ... */ }
    if (error.code === 'ER_DUP_ENTRY') { /* ... */ }
    return NextResponse.json({ message: 'Failed to create room.' }, { status: 500 });
  }
}