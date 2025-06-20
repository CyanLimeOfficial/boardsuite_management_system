// app/api/dashboard/payments/payments/route.ts
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

        const body = await request.json();
        const { bill_id, amount_paid, payment_date, payment_method, notes } = body;

        if (!bill_id || !amount_paid || !payment_date || !payment_method) {
            return new NextResponse(JSON.stringify({ message: 'Missing required fields.' }), { status: 400 });
        }
        
        const pool = getPool();
        const connection = await pool.getConnection();
        
        try {
            await connection.beginTransaction();

            // 1. Get bill details to find the tenant_id
            const [billRows] = await connection.query('SELECT tenant_id, amount_due FROM bills WHERE id = ?', [bill_id]);
            const bills = billRows as any[];
            if (bills.length === 0) {
                throw new Error('Bill not found.');
            }
            const bill = bills[0];

            // 2. Insert the new payment record
            const insertPaymentSql = `
                INSERT INTO payments (bill_id, tenant_id, user_id, amount_paid, payment_date, payment_method, notes)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `;
            await connection.execute(insertPaymentSql, [
                bill_id,
                bill.tenant_id,
                adminUserId,
                amount_paid,
                payment_date,
                payment_method,
                notes
            ]);
            
            // 3. Calculate total paid for this bill and update its status
            const [paymentSumRows] = await connection.query('SELECT SUM(amount_paid) as total_paid FROM payments WHERE bill_id = ?', [bill_id]);
            const totalPaid = (paymentSumRows as any[])[0].total_paid || 0;

            let newStatus: 'Partially Paid' | 'Paid' = 'Partially Paid';
            if (parseFloat(totalPaid) >= parseFloat(bill.amount_due)) {
                newStatus = 'Paid';
            }
            
            await connection.execute('UPDATE bills SET status = ? WHERE id = ?', [newStatus, bill_id]);

            await connection.commit();

            return NextResponse.json({ message: 'Payment recorded successfully' });

        } catch (error) {
            await connection.rollback();
            throw error; // Re-throw to be caught by outer catch block
        } finally {
            connection.release();
        }

    } catch (error: any) {
        console.error('API Error:', error);
        return new NextResponse(JSON.stringify({ message: 'Internal Server Error', error: error.message }), { status: 500 });
    }
}
