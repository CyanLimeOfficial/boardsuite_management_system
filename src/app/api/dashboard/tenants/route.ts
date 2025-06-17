// app/api/dashboard/tenants/route.ts
import { NextResponse } from 'next/server';
import getPool from '@/library/db';
import { PoolConnection } from 'mysql2/promise';

/**
 * Handles GET requests to fetch all tenants and their assigned room number.
 */
export async function GET() {
  try {
    const pool = getPool();
    // This query joins the tenants and rooms tables to include the room_number
    // for each tenant, which is useful for the display table.
    const query = `
      SELECT 
        t.*, 
        r.room_number 
      FROM tenants t
      LEFT JOIN rooms r ON t.room_id = r.id
      ORDER BY t.full_name ASC;
    `;
    const [rows] = await pool.query(query);

    return NextResponse.json(rows);

  } catch (error) {
    console.error('API GET /api/dashboard/tenants Error:', error);
    return NextResponse.json({ message: 'Failed to fetch tenants.' }, { status: 500 });
  }
}

/**
 * Handles POST requests to create a new tenant, with optional room assignment.
 * Uses a database transaction to ensure data integrity.
 */
export async function POST(request: Request) {
  let connection: PoolConnection | undefined;
  try {
    // Destructure all expected fields from the request body
    const { 
      full_name, 
      contact_number, 
      email, 
      address, 
      emergency_contact_name, 
      emergency_contact_number,
      room_id // This can be a room ID or null/undefined
    } = await request.json();

    // The only required field is the tenant's full name
    if (!full_name) {
      return NextResponse.json({ message: 'Full name is required.' }, { status: 400 });
    }

    const pool = getPool();
    connection = await pool.getConnection();
    await connection.beginTransaction(); // Start the transaction

    // Step 1: Insert the new tenant into the database.
    // The room_id will be inserted as NULL if it's not provided.
    const insertTenantQuery = `
      INSERT INTO tenants (full_name, contact_number, email, address, emergency_contact_name, emergency_contact_number, room_id) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await connection.execute(insertTenantQuery, [
      full_name, contact_number || null, email || null, address || null, 
      emergency_contact_name || null, emergency_contact_number || null, room_id || null
    ]);

    // Step 2: If a room was assigned, update that room's status to 'Occupied'.
    if (room_id) {
      const updateRoomQuery = `UPDATE rooms SET status = 'Occupied' WHERE id = ? AND status = 'Available'`;
      const [updateResult] = await connection.execute(updateRoomQuery, [room_id]);
      
      // If no rows were updated, it means the room was already occupied or didn't exist.
      // We must cancel the entire operation.
      if ((updateResult as any).affectedRows === 0) {
        throw new Error('The selected room is no longer available. Please choose another.');
      }
    }

    // If both queries succeed, commit the transaction to save all changes.
    await connection.commit();

    return NextResponse.json({ message: 'Tenant registered successfully!', newTenantId: (result as any).insertId }, { status: 201 });

  } catch (error: any) {
    // If any error occurred during the try block, roll back all changes.
    if (connection) {
      await connection.rollback();
    }
    
    // Handle specific, common database errors with user-friendly messages.
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ message: 'A tenant with this email already exists.' }, { status: 409 });
    }
    if (error.message.includes('no longer available')) {
        return NextResponse.json({ message: error.message }, { status: 409 });
    }

    // For all other errors, log them and return a generic server error.
    console.error('API POST /api/dashboard/tenants Error:', error);
    return NextResponse.json({ message: 'Failed to register tenant.' }, { status: 500 });
  } finally {
    // No matter what happens, always release the connection back to the pool.
    if (connection) {
      connection.release();
    }
  }
}
