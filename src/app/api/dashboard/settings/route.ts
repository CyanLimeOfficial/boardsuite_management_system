// In file: app/api/dashboard/settings/route.ts

import { NextResponse } from 'next/server';
import getPool from '@/library/db';
import { verify } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// --- GET Handler: Fetches combined settings and user data ---
export async function GET(request: Request) {
    try {
        const token = request.headers.get('authorization')?.split(' ')[1];
        if (!token) {
            return new NextResponse(JSON.stringify({ message: 'Authentication required' }), { status: 401 });
        }
        const decoded = verify(token, process.env.JWT_SECRET || 'YOUR_SECRET_KEY') as { id: number };
        const adminUserId = decoded.id;

        const pool = getPool();
        
        // Fetch both settings and user data in parallel
        const [settingsResult, userResult] = await Promise.all([
            pool.query("SELECT boarding_house_name, business_address, contact_phone, contact_email, gemini_api_key FROM settings WHERE id = 1 LIMIT 1"),
            pool.query("SELECT id, username, full_name FROM users WHERE id = ?", [adminUserId])
        ]);

        const settings = (settingsResult[0] as any[])[0] || {};
        const user = (userResult[0] as any[])[0];

        if (!user) {
            return new NextResponse(JSON.stringify({ message: 'User not found.' }), { status: 404 });
        }

        // Combine data into a single object for the client
        const responseData = { ...settings, ...user };

        return NextResponse.json(responseData);

    } catch (error: any) {
        console.error('API GET Error:', error);
        return new NextResponse(JSON.stringify({ message: 'Internal Server Error' }), { status: 500 });
    }
}

// --- PUT Handler: Updates settings and user data ---
export async function PUT(request: Request) {
    try {
        const token = request.headers.get('authorization')?.split(' ')[1];
        if (!token) {
            return new NextResponse(JSON.stringify({ message: 'Authentication required' }), { status: 401 });
        }
        const decoded = verify(token, process.env.JWT_SECRET || 'YOUR_SECRET_KEY') as { id: number };
        const adminUserId = decoded.id;

        const body = await request.json();
        const { boarding_house_name, business_address, contact_phone, contact_email, gemini_api_key, full_name, new_password } = body;

        const pool = getPool();
        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            // 1. Update the settings table
            const settingsSql = `
                UPDATE settings SET
                    boarding_house_name = ?,
                    business_address = ?,
                    contact_phone = ?,
                    contact_email = ?,
                    gemini_api_key = ?
                WHERE id = 1
            `;
            await connection.execute(settingsSql, [boarding_house_name, business_address, contact_phone, contact_email, gemini_api_key]);

            // 2. Update the user's full name
            const updateUserSql = "UPDATE users SET full_name = ? WHERE id = ?";
            await connection.execute(updateUserSql, [full_name, adminUserId]);

            // 3. If a new password is provided, hash it and update it
            if (new_password && new_password.trim() !== '') {
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(new_password, salt);
                const updatePasswordSql = "UPDATE users SET password = ? WHERE id = ?";
                await connection.execute(updatePasswordSql, [hashedPassword, adminUserId]);
            }

            await connection.commit();
            return NextResponse.json({ message: 'Settings and profile updated successfully.' });

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }

    } catch (error: any) {
        console.error('API PUT Error:', error);
        return new NextResponse(JSON.stringify({ message: 'Internal Server Error' }), { status: 500 });
    }
}
