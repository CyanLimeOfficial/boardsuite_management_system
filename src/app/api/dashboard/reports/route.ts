// In file: app/api/dashboard/reports/route.ts

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

        const { searchParams } = new URL(request.url);
        const year = searchParams.get('year');
        const month = searchParams.get('month');

        if (!year || !month) {
            return new NextResponse(JSON.stringify({ message: 'Year and month are required.' }), { status: 400 });
        }

        const pool = getPool();

        // --- Execute all queries in parallel ---
        const [
            salesResult,
            pendingResult,
            paymentsListResult,
            pendingListResult
        ] = await Promise.all([
            // 1. Get total sales for the selected month
            pool.query("SELECT SUM(amount_paid) as totalSales FROM payments WHERE YEAR(payment_date) = ? AND MONTH(payment_date) = ?", [year, month]),

            // 2. Get total pending dues from all unpaid bills
            pool.query("SELECT SUM(amount_due) as totalPending FROM bills WHERE status != 'Paid'"),

            // 3. Get detailed list of payments for the selected month
            pool.query(`
                SELECT p.id, p.amount_paid, p.payment_date, t.full_name as tenant_name
                FROM payments p
                JOIN tenants t ON p.tenant_id = t.id
                WHERE YEAR(p.payment_date) = ? AND MONTH(p.payment_date) = ?
                ORDER BY p.payment_date DESC
            `, [year, month]),

            // 4. Get detailed list of all pending bills
            pool.query(`
                SELECT b.id, b.amount_due, b.due_date, t.full_name as tenant_name, b.status
                FROM bills b
                JOIN tenants t ON b.tenant_id = t.id
                WHERE b.status != 'Paid'
                ORDER BY b.due_date ASC
            `, [])
        ]);

        // --- Process and combine results ---
        const report = {
            monthlySales: (salesResult[0] as any[])[0].totalSales || 0,
            totalPending: (pendingResult[0] as any[])[0].totalPending || 0,
            payments: paymentsListResult[0],
            pendingBills: pendingListResult[0],
        };

        return NextResponse.json(report);

    } catch (error: any) {
        console.error('API Error in /dashboard/reports:', error);
        return new NextResponse(JSON.stringify({ message: 'Internal Server Error' }), { status: 500 });
    }
}
