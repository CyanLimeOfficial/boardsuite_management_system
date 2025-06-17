    // app/api/dashboard/rooms/[roomId]/route.ts
    import { NextRequest, NextResponse } from 'next/server';
    import getPool from '@/library/db';
    import jwt from 'jsonwebtoken';

    interface UserJwtPayload {
      id: number;
    }

    // Helper function to verify the token
    const verifyToken = (request: NextRequest): UserJwtPayload | null => {
        try {
            const token = request.headers.get('authorization')?.split(' ')[1];
            if (!token) return null;
            return jwt.verify(token, process.env.JWT_SECRET!) as UserJwtPayload;
        } catch (error) {
            return null;
        }
    };

    /**
     * Handles PUT requests to update a specific room.
     */
    export async function PUT(request: NextRequest, { params }: { params: { roomId: string } }) {
      if (!verifyToken(request)) {
        return NextResponse.json({ message: 'Authentication required.' }, { status: 401 });
      }

      const { roomId } = params;
      try {
        const { room_number, description, capacity, rate_per_month, status } = await request.json();

        if (!room_number || !capacity || !rate_per_month || !status) {
          return NextResponse.json({ message: 'All fields are required.' }, { status: 400 });
        }

        const pool = getPool();
        const query = `
          UPDATE rooms 
          SET room_number = ?, description = ?, capacity = ?, rate_per_month = ?, status = ?
          WHERE id = ?
        `;
        await pool.execute(query, [room_number, description, capacity, rate_per_month, status, roomId]);

        return NextResponse.json({ message: 'Room updated successfully.' });

      } catch (error: any) {
        if (error.code === 'ER_DUP_ENTRY') {
          return NextResponse.json({ message: `Room number "${error.value}" already exists.` }, { status: 409 });
        }
        console.error(`API PUT /api/dashboard/rooms/${roomId} Error:`, error);
        return NextResponse.json({ message: 'Failed to update room.' }, { status: 500 });
      }
    }

    /**
     * Handles DELETE requests to delete a specific room.
     */
    export async function DELETE(request: NextRequest, { params }: { params: { roomId: string } }) {
        if (!verifyToken(request)) {
            return NextResponse.json({ message: 'Authentication required.' }, { status: 401 });
        }

        const { roomId } = params;
        try {
            const pool = getPool();
            // We should first check if the room has any tenants assigned to it
            const [tenantRows] = await pool.query('SELECT id FROM tenants WHERE room_id = ?', [roomId]);
            if ((tenantRows as any[]).length > 0) {
                return NextResponse.json({ message: 'Cannot delete room. It is currently occupied.' }, { status: 409 });
            }

            const [result] = await pool.execute('DELETE FROM rooms WHERE id = ?', [roomId]);

            if ((result as any).affectedRows === 0) {
                return NextResponse.json({ message: 'Room not found.' }, { status: 404 });
            }

            return NextResponse.json({ message: 'Room deleted successfully.' });

        } catch (error) {
            console.error(`API DELETE /api/dashboard/rooms/${roomId} Error:`, error);
            return NextResponse.json({ message: 'Failed to delete room.' }, { status: 500 });
        }
    }
    