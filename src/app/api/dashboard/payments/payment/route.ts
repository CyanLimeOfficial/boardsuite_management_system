// In file: app/api/dashboard/payments/payment/route.ts
import { NextResponse } from 'next/server';
import getPool from '@/library/db'; // Make sure this import path is correct for your project
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

        const body = await request.json();
        const { bill_id, amount_paid, payment_date, payment_method, notes } = body;

        if (!bill_id || !amount_paid || !payment_date || !payment_method) {
            return new NextResponse(JSON.stringify({ message: 'Missing required fields.' }), { status: 400 });
        }
        
        const pool = getPool();
        const connection = await pool.getConnection();
        
        try {
            await connection.beginTransaction();

            // 1. Get bill details to find the tenant_id and amount_due
            const [billRows] = await connection.query('SELECT tenant_id, amount_due FROM bills WHERE id = ?', [bill_id]);
            const bills = billRows as any[];
            if (bills.length === 0) {
                throw new Error('Bill not found.');
            }
            const bill = bills[0];
            const tenantId = bill.tenant_id;

            // 2. Insert the new payment record
            const insertPaymentSql = `
                INSERT INTO payments (bill_id, tenant_id, user_id, amount_paid, payment_date, payment_method, notes)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `;
            await connection.execute(insertPaymentSql, [
                bill_id,
                tenantId,
                adminUserId,
                amount_paid,
                payment_date,
                payment_method,
                notes || null 
            ]);
            
            // 3. Calculate total paid for this bill and determine the new status
            const [paymentSumRows] = await connection.query('SELECT SUM(amount_paid) as total_paid FROM payments WHERE bill_id = ?', [bill_id]);
            const totalPaid = (paymentSumRows as any[])[0].total_paid || 0;

            let newStatus: 'Partially Paid' | 'Paid' = 'Partially Paid';
            if (parseFloat(totalPaid) >= parseFloat(bill.amount_due)) {
                newStatus = 'Paid';
            }
            
            // 4. Update the bill status
            await connection.execute('UPDATE bills SET status = ? WHERE id = ?', [newStatus, bill_id]);

            // --- NEW LOGIC ADDED HERE ---
            // 5. If the bill is now fully Paid, update the tenant's last_payment_date
            if (newStatus === 'Paid') {
                const updateTenantSql = 'UPDATE tenants SET last_payment_date = ? WHERE id = ?';
                await connection.execute(updateTenantSql, [payment_date, tenantId]);
            }

            await connection.commit();

            return NextResponse.json({ message: 'Payment recorded successfully' });

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }

    } catch (error: any) {
        console.error('API Error in /payments/payment:', error);
        return new NextResponse(JSON.stringify({ message: 'Internal Server Error', error: error.message }), { status: 500 });
    }
}
