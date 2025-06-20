// app/api/dashboard/payments/route.ts (for GET)
import { NextResponse } from 'next/server';
import getPool from '@/library/db';
import { verify } from 'jsonwebtoken';

export async function GET(request: Request) {
    try {
        const token = request.headers.get('authorization')?.split(' ')[1];
        if (!token) {
            return new NextResponse(JSON.stringify({ message: 'Authentication required' }), { status: 401 });
        }
        verify(token, process.env.JWT_SECRET || 'YOUR_SECRET_KEY');

        const pool = getPool();
        const sql = `
            SELECT 
                b.id, b.tenant_id, b.amount_due, b.bill_date, b.due_date, b.status,
                t.full_name as tenant_name,
                r.room_number
            FROM bills b
            JOIN tenants t ON b.tenant_id = t.id
            JOIN rooms r ON b.room_id = r.id
            ORDER BY b.bill_date DESC;
        `;
        const [rows] = await pool.query(sql);
        
        return NextResponse.json(rows);
    } catch (error: any) {
        console.error('API Error:', error);
        return new NextResponse(JSON.stringify({ message: 'Internal Server Error' }), { status: 500 });
    }
}