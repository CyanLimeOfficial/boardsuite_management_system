// In file: app/api/dashboard/settings/route.ts

import { NextResponse } from 'next/server';
import getPool from '@/library/db';
import { verify } from 'jsonwebtoken';

// --- GET Handler: Fetches the current settings ---
export async function GET(request: Request) {
    try {
        const token = request.headers.get('authorization')?.split(' ')[1];
        if (!token) {
            return new NextResponse(JSON.stringify({ message: 'Authentication required' }), { status: 401 });
        }
        verify(token, process.env.JWT_SECRET || 'YOUR_SECRET_KEY');

        const pool = getPool();
        // The settings table is designed to have only one row with id = 1.
        const sql = "SELECT * FROM settings WHERE id = 1 LIMIT 1";
        const [rows] = await pool.query(sql);

        const settings = (rows as any[])[0] || {};
        
        // Parse payment_methods from JSON string to an array for the client
        if (settings.payment_methods) {
            settings.payment_methods = JSON.parse(settings.payment_methods);
        } else {
            settings.payment_methods = [];
        }

        return NextResponse.json(settings);

    } catch (error: any) {
        console.error('API GET Error:', error);
        return new NextResponse(JSON.stringify({ message: 'Internal Server Error' }), { status: 500 });
    }
}

// --- PUT Handler: Updates the settings ---
export async function PUT(request: Request) {
    try {
        const token = request.headers.get('authorization')?.split(' ')[1];
        if (!token) {
            return new NextResponse(JSON.stringify({ message: 'Authentication required' }), { status: 401 });
        }
        const decoded = verify(token, process.env.JWT_SECRET || 'YOUR_SECRET_KEY') as { id: number };
        const adminUserId = decoded.id;

        const body = await request.json();

        // Convert payment_methods array back to a JSON string for database storage
        const paymentMethodsJson = JSON.stringify(body.payment_methods || []);

        const pool = getPool();
        const sql = `
            UPDATE settings SET
                user_id = ?,
                boarding_house_name = ?,
                business_address = ?,
                contact_phone = ?,
                contact_email = ?,
                currency_symbol = ?,
                default_due_period = ?,
                late_fees_enabled = ?,
                late_fee_type = ?,
                late_fee_amount = ?,
                payment_methods = ?,
                gemini_api_key = ?
            WHERE id = 1
        `;

        await pool.execute(sql, [
            adminUserId,
            body.boarding_house_name,
            body.business_address,
            body.contact_phone,
            body.contact_email,
            body.currency_symbol,
            body.default_due_period,
            body.late_fees_enabled,
            body.late_fee_type,
            body.late_fee_amount,
            paymentMethodsJson,
            body.gemini_api_key
        ]);

        return NextResponse.json({ message: 'Settings updated successfully.' });

    } catch (error: any) {
        console.error('API PUT Error:', error);
        return new NextResponse(JSON.stringify({ message: 'Internal Server Error' }), { status: 500 });
    }
}
