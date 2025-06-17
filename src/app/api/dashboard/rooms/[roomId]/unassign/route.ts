// app/api/dashboard/rooms/[roomId]/unassign/route.ts
import { NextRequest, NextResponse } from 'next/server';
import getPool from '@/library/db';
import { PoolConnection } from 'mysql2/promise';
import jwt from 'jsonwebtoken';

// Helper function to verify the token to secure the endpoint
const verifyToken = (request: NextRequest): boolean => {
    try {
        const token = request.headers.get('authorization')?.split(' ')[1];
        if (!token) return false;
        jwt.verify(token, process.env.JWT_SECRET!);
        return true;
    } catch (error) {
        return false;
    }
};

/**
 * Handles POST requests to unassign a tenant from a specific room.
 * This is triggered by the "Remove Occupant" button.
 */
export async function POST(request: NextRequest, context: { params: { roomId: string } }) {
  // Protect the route: ensure the user is logged in
  if (!verifyToken(request)) {
    return NextResponse.json({ message: 'Authentication required.' }, { status: 401 });
  }
  
  // --- THIS IS THE FIX ---
  // We now get the roomId from the 'context.params' object.
  const { roomId } = context.params;
  let connection: PoolConnection | undefined;

  try {
    const pool = getPool();
    connection = await pool.getConnection();
    await connection.beginTransaction(); // Start a secure database transaction

    // Step 1: Find the first tenant currently assigned to this room.
    // In a single-occupant scenario, this is sufficient.
    const [tenantRows] = await connection.execute('SELECT id FROM tenants WHERE room_id = ? LIMIT 1', [roomId]);
    const tenants = tenantRows as any[];

    if (tenants.length === 0) {
      throw new Error('No tenant is assigned to this room to unassign.');
    }
    const tenantId = tenants[0].id;

    // Step 2: Unassign the tenant by setting their room_id to NULL
    await connection.execute('UPDATE tenants SET room_id = NULL WHERE id = ?', [tenantId]);

    // Step 3: Update the room's status back to 'Available'
    await connection.execute("UPDATE rooms SET status = 'Available' WHERE id = ?", [roomId]);

    // If all steps succeed, commit the changes to the database
    await connection.commit();

    return NextResponse.json({ message: 'Occupant successfully removed and room is now available.' });

  } catch (error: any) {
    // If any step fails, undo all changes to prevent data corruption
    if (connection) await connection.rollback(); 
    
    console.error(`API POST /api/dashboard/rooms/${roomId}/unassign Error:`, error);
    return NextResponse.json({ message: error.message || 'Failed to remove occupant.' }, { status: 500 });
  } finally {
    // Always release the connection back to the pool
    if (connection) connection.release();
  }
}
