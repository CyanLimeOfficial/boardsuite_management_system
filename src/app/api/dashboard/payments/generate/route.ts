// app/api/dashboard/payments/generate/route.ts (for POST)
// In file: app/api/dashboard/payments/generate/route.ts

import { NextResponse } from 'next/server';
import getPool from '@/library/db';
import { verify } from 'jsonwebtoken';

export async function POST(request: Request) {
    try {
        const token = request.headers.get('authorization')?.split(' ')[1];
        if (!token) {
            return new NextResponse(JSON.stringify({ message: 'Authentication required' }), { status: 401 });
        }
        const decoded = verify(token, process.env.JWT_SECRET || 'YOUR_SECRET_KEY') as { userId: number };
        const adminUserId = decoded.userId;

        const pool = getPool();

        // 1. Find all tenants in occupied rooms who haven't been billed this month
        const thisMonth = new Date().getMonth() + 1;
        const thisYear = new Date().getFullYear();

        const findTenantsToBillSql = `
            SELECT t.id as tenant_id, r.id as room_id, r.rate_per_month
            FROM tenants t
            JOIN rooms r ON t.room_id = r.id
            WHERE r.status = 'Occupied' AND t.id NOT IN (
                SELECT tenant_id FROM bills
                WHERE MONTH(bill_date) = ? AND YEAR(bill_date) = ?
            )
        `;

        const [tenantsToBill] = await pool.query(findTenantsToBillSql, [thisMonth, thisYear]);
        const tenants = tenantsToBill as any[];

        if (tenants.length === 0) {
            return NextResponse.json({ message: 'All active tenants have already been billed for this month.' });
        }

        // 2. Create new bills for each tenant
        let billsCreatedCount = 0;
        for (const tenant of tenants) {
            const billDate = new Date();
            const dueDate = new Date(billDate);
            dueDate.setDate(dueDate.getDate() + 15); // Due in 15 days

            const insertBillSql = `
                INSERT INTO bills (tenant_id, room_id, user_id, amount_due, bill_date, due_date, status)
                VALUES (?, ?, ?, ?, ?, ?, 'Pending')
            `;
            await pool.execute(insertBillSql, [
                tenant.tenant_id,
                tenant.room_id,
                adminUserId,
                tenant.rate_per_month,
                billDate,
                dueDate
            ]);
            billsCreatedCount++;
        }

        return NextResponse.json({ message: `Successfully generated ${billsCreatedCount} new bills.` });
    } catch (error: any) {
        console.error('API Error:', error);
        return new NextResponse(JSON.stringify({ message: 'Internal Server Error' }), { status: 500 });
    }
}

