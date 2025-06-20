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
        
        const decoded = verify(token, process.env.JWT_SECRET || 'YOUR_SECRET_KEY') as { id: number };
        const adminUserId = decoded.id; 

        if (!adminUserId) {
            return new NextResponse(JSON.stringify({ message: 'Invalid token payload: User ID not found.' }), { status: 401 });
        }

        const pool = getPool();

        // 1. Get all tenants who are currently in a room.
        const findTenantsSql = `
            SELECT 
                t.id as tenant_id, 
                r.id as room_id, 
                r.rate_per_month
            FROM tenants t
            JOIN rooms r ON t.room_id = r.id
        `;
        
        const [tenantsResult] = await pool.query(findTenantsSql);
        const allTenants = tenantsResult as any[];
        
        let billsCreatedCount = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalize today's date for accurate comparisons

        // 2. Loop through each tenant to determine if they are due for a bill.
        for (const tenant of allTenants) {
            // For each tenant, find the date of their most recent bill.
            const findLastBillSql = `
                SELECT MAX(bill_date) as lastBillDate 
                FROM bills 
                WHERE tenant_id = ?
            `;
            const [lastBillResult] = await pool.query(findLastBillSql, [tenant.tenant_id]);
            const lastBillDate = (lastBillResult as any[])[0].lastBillDate;

            let shouldGenerateBill = false;

            if (!lastBillDate) {
                // --- RULE 1: Tenant has never been billed ---
                // Generate their first bill.
                shouldGenerateBill = true;
            } else {
                // --- RULE 2: Tenant has a billing history ---
                // Calculate the next billing date, which is one month after the last bill was generated.
                const lastBill = new Date(lastBillDate);
                const nextBillingDate = new Date(lastBill.setMonth(lastBill.getMonth() + 1));
                
                // If today is on or after the next billing date, they are due for a new bill.
                if (today >= nextBillingDate) {
                    shouldGenerateBill = true;
                }
            }

            // 3. If a bill is needed, create it.
            if (shouldGenerateBill) {
                const billDate = new Date();
                const dueDate = new Date();
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
        }

        if (billsCreatedCount === 0) {
            return NextResponse.json({ message: 'No new bills were due to be generated at this time.' });
        }

        return NextResponse.json({ message: `Successfully generated ${billsCreatedCount} new bills.` });
    } catch (error: any) {
        console.error('API Error in /payments/generate:', error);
        return new NextResponse(JSON.stringify({ message: 'Internal Server Error' }), { status: 500 });
    }
}
