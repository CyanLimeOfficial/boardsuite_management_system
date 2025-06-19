// For App Router:   app/api/dashboard/tenants/[tenantId]/mark-paid/route.ts

import { NextResponse } from 'next/server';
import getPool from '@/library/db'; // Use getPool for the database connection
import { verify } from 'jsonwebtoken'; // Or your preferred JWT verification method

export async function POST(
  request: Request,
  { params }: { params: { tenantId: string } } // Updated parameter name
) {
  try {
    // 1. Authenticate the request
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];
    if (!token) {
      return new NextResponse(JSON.stringify({ message: 'Authentication required' }), { status: 401 });
    }
    // Replace 'YOUR_SECRET_KEY' with your actual JWT secret
    verify(token, process.env.JWT_SECRET || 'YOUR_SECRET_KEY');
    
    // 2. Get the tenant ID from the URL
    const tenantId = parseInt(params.tenantId, 10); // Updated to use params.tenantId
    if (isNaN(tenantId)) {
      return new NextResponse(JSON.stringify({ message: 'Invalid Tenant ID' }), { status: 400 });
    }
    
    // 3. Update the database using mysql2
    const today = new Date();
    const pool = getPool();
    
    // The table should be `tenants` and the column `last_payment_date`
    const sql = "UPDATE tenants SET last_payment_date = ? WHERE id = ?";
    
    const [result] = await pool.execute(sql, [today, tenantId]);

    // Check if the update was successful
    const updateResult = result as any; // Cast to access properties
    if (updateResult.affectedRows === 0) {
        return new NextResponse(JSON.stringify({ message: `Tenant with ID ${tenantId} not found.` }), { status: 404 });
    }
    
    // 4. Send a success response
    return NextResponse.json({ 
        message: 'Payment status updated successfully.',
        last_payment_date: today.toISOString() // Return the date used for the update
    });

  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
        return new NextResponse(JSON.stringify({ message: 'Invalid token' }), { status: 401 });
    }
    console.error('API Error:', error);
    return new NextResponse(JSON.stringify({ message: 'Internal Server Error' }), { status: 500 });
  }
}
