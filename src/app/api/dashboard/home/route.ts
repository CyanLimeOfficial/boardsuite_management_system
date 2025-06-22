// In file: app/api/dashboard/stats/route.ts

import { NextResponse } from 'next/server';
import getPool from '@/library/db'; // Use your actual path to the db utility
import { verify } from 'jsonwebtoken';

export async function GET(request: Request) {
    try {
        // --- Authentication ---
        const token = request.headers.get('authorization')?.split(' ')[1];
        if (!token) {
            return new NextResponse(JSON.stringify({ message: 'Authentication required' }), { status: 401 });
        }
        verify(token, process.env.JWT_SECRET || 'YOUR_SECRET_KEY');

        const pool = getPool();
        
        // --- Execute all queries in parallel for efficiency ---
        const [
            tenantsResult,
            roomsResult,
            pendingResult,
            revenueResult
        ] = await Promise.all([
            // 1. Get total number of tenants
            pool.query("SELECT COUNT(*) as totalTenants FROM tenants"),

            // 2. Get occupied and total rooms
            pool.query("SELECT COUNT(CASE WHEN status = 'Occupied' THEN 1 END) as occupiedRooms, COUNT(*) as totalRooms FROM rooms"),

            // 3. Get total pending payments from all unpaid bills
            pool.query("SELECT COUNT(*) as pendingCount, SUM(amount_due) as pendingAmount FROM bills WHERE status IN ('Pending', 'Partially Paid', 'Overdue')"),

            // 4. Get revenue for the current month
            pool.query("SELECT SUM(amount_paid) as monthlyRevenue FROM payments WHERE YEAR(payment_date) = YEAR(CURDATE()) AND MONTH(payment_date) = MONTH(CURDATE())")
        ]);

        // --- Extract and process results ---
        const totalTenants = (tenantsResult[0] as any[])[0].totalTenants || 0;
        const { occupiedRooms, totalRooms } = (roomsResult[0] as any[])[0];
        const { pendingCount, pendingAmount } = (pendingResult[0] as any[])[0];
        const monthlyRevenue = (revenueResult[0] as any[])[0].monthlyRevenue || 0;
        
        // --- Combine into a single stats object ---
        const stats = {
            totalTenants,
            occupiedRooms: occupiedRooms || 0,
            totalRooms: totalRooms || 0,
            pendingCount: pendingCount || 0,
            pendingAmount: pendingAmount || 0,
            monthlyRevenue: monthlyRevenue || 0,
        };

        return NextResponse.json(stats);

    } catch (error: any) {
        console.error('API Error in /dashboard/stats:', error);
        return new NextResponse(JSON.stringify({ message: 'Internal Server Error' }), { status: 500 });
    }
}
