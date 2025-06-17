// File 1: app/api/dashboard/tenants/[tenantId]/route.ts
// This API handles updating and deleting a specific tenant's details.

import { NextRequest, NextResponse } from 'next/server';
import getPool from '@/library/db';
import jwt from 'jsonwebtoken';

const verifyToken = (request: NextRequest): boolean => {
    try {
        const token = request.headers.get('authorization')?.split(' ')[1];
        if (!token) return false;
        jwt.verify(token, process.env.JWT_SECRET!);
        return true;
    } catch (error) { return false; }
};

/**
 * Handles PUT requests to update a tenant's personal information.
 */
export async function PUT(request: NextRequest, { params }: { params: { tenantId: string } }) {
  if (!verifyToken(request)) {
    return NextResponse.json({ message: 'Authentication required.' }, { status: 401 });
  }

  const { tenantId } = params;
  try {
    const { full_name, contact_number, email, address, emergency_contact_name, emergency_contact_number } = await request.json();

    if (!full_name) {
      return NextResponse.json({ message: 'Full name is required.' }, { status: 400 });
    }

    const pool = getPool();
    const query = `
      UPDATE tenants SET 
        full_name = ?, 
        contact_number = ?, 
        email = ?, 
        address = ?, 
        emergency_contact_name = ?, 
        emergency_contact_number = ?
      WHERE id = ?
    `;
    await pool.execute(query, [full_name, contact_number, email, address, emergency_contact_name, emergency_contact_number, tenantId]);

    return NextResponse.json({ message: 'Tenant details updated successfully.' });

  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ message: 'Another tenant with this email already exists.' }, { status: 409 });
    }
    console.error(`API PUT /api/dashboard/tenants/${tenantId} Error:`, error);
    return NextResponse.json({ message: 'Failed to update tenant details.' }, { status: 500 });
  }
}

/**
 * Handles DELETE requests to remove a tenant permanently.
 */
export async function DELETE(request: NextRequest, { params }: { params: { tenantId: string } }) {
    if (!verifyToken(request)) {
        return NextResponse.json({ message: 'Authentication required.' }, { status: 401 });
    }

    const { tenantId } = params;
    try {
        const pool = getPool();
        // First, check if the tenant is in a room and unassign them if so.
        // This logic can be expanded, but for now, we'll focus on deletion.
        
        const [result] = await pool.execute('DELETE FROM tenants WHERE id = ?', [tenantId]);

        if ((result as any).affectedRows === 0) {
            return NextResponse.json({ message: 'Tenant not found.' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Tenant deleted successfully.' });

    } catch (error) {
        console.error(`API DELETE /api/dashboard/tenants/${tenantId} Error:`, error);
        return NextResponse.json({ message: 'Failed to delete tenant.' }, { status: 500 });
    }
}


// --- --- ---


// File 2: app/api/dashboard/tenants/[tenantId]/relocate/route.ts
// This API handles the complex logic of relocating a tenant to a new room.

import { PoolConnection } from 'mysql2/promise';

export async function POST(request: NextRequest, { params }: { params: { tenantId: string } }) {
  if (!verifyToken(request)) {
    return NextResponse.json({ message: 'Authentication required.' }, { status: 401 });
  }

  const { tenantId } = params;
  const { newRoomId } = await request.json();
  let connection: PoolConnection | undefined;

  if (!newRoomId) {
    return NextResponse.json({ message: 'A new room must be selected for relocation.' }, { status: 400 });
  }

  try {
    const pool = getPool();
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Step 1: Get the tenant's current room ID.
    const [tenantRows] = await connection.execute("SELECT room_id FROM tenants WHERE id = ? FOR UPDATE", [tenantId]);
    const oldRoomId = (tenantRows as any[])[0]?.room_id;

    // Step 2: Check if the new room is available.
    const [newRoomRows] = await connection.execute("SELECT status FROM rooms WHERE id = ? FOR UPDATE", [newRoomId]);
    if ((newRoomRows as any[])[0]?.status !== 'Available') {
      throw new Error('Destination room is not available.');
    }

    // Step 3: If the tenant had an old room, update its status.
    if (oldRoomId) {
      const [occupants] = await connection.execute("SELECT id FROM tenants WHERE room_id = ? AND id != ?", [oldRoomId, tenantId]);
      if ((occupants as any[]).length === 0) {
        await connection.execute("UPDATE rooms SET status = 'Available' WHERE id = ?", [oldRoomId]);
      }
    }

    // Step 4: Relocate the tenant to the new room.
    await connection.execute("UPDATE tenants SET room_id = ? WHERE id = ?", [newRoomId, tenantId]);
    
    // Step 5: Mark the new room as 'Occupied'.
    await connection.execute("UPDATE rooms SET status = 'Occupied' WHERE id = ?", [newRoomId]);

    await connection.commit();
    return NextResponse.json({ message: 'Tenant relocated successfully.' });

  } catch (error: any) {
    if (connection) await connection.rollback();
    console.error('API POST relocate Error:', error);
    return NextResponse.json({ message: error.message || 'Failed to relocate tenant.' }, { status: 500 });
  } finally {
    if (connection) connection.release();
  }
}
