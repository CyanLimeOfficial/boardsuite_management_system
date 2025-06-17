// app/rooms/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import CreateRoomModal from '@/components/nav/CreateRoomModal';

// --- ICONS ---
const BedIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
  </svg>
);
const UsersIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-4.67c.12-.24.232-.49.335-.737m-3.05-2.828c.328.316.63.645.923.982m-7.463-3.642a9.33 9.33 0 015.861-5.517m5.861 5.517a9.33 9.33 0 00-5.861-5.517m0 0a5.25 5.25 0 00-9.672 0m11.313 0c.36.36.672.734.946 1.124" />
  </svg>
);


// --- Room Interface ---
interface Room {
  id: number;
  room_number: string;
  description: string | null;
  status: 'Available' | 'Occupied' | 'Under Maintenance';
  capacity: number;
  rate_per_month: number;
}

// --- getStatusClasses helper ---
const getStatusClasses = (status: string) => {
  switch (status) {
    case 'Available': return { bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500' };
    case 'Occupied': return { bg: 'bg-red-100', text: 'text-red-800', dot: 'bg-red-500' };
    case 'Under Maintenance': return { bg: 'bg-yellow-100', text: 'text-yellow-800', dot: 'bg-yellow-500' };
    default: return { bg: 'bg-gray-100', text: 'text-gray-800', dot: 'bg-gray-500' };
  }
};

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchRooms = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      // --- FIX: Updated the API endpoint URL ---
      const response = await fetch('/api/dashboard/rooms');
      if (!response.ok) throw new Error('Failed to fetch rooms from the server.');
      const data = await response.json();
      setRooms(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  const totalRooms = rooms.length;
  const availableRooms = rooms.filter(r => r.status === 'Available').length;
  const occupiedRooms = rooms.filter(r => r.status === 'Occupied').length;

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <CreateRoomModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onRoomCreated={fetchRooms}
      />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Room Management</h1>
          <p className="mt-1 text-gray-600">Overview of all rooms in the boarding house.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="mt-4 md:mt-0 bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
        >
          + Create New Room
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow"><h3 className="text-sm font-medium text-gray-500">Total Rooms</h3><p className="mt-1 text-3xl font-semibold text-gray-900">{totalRooms}</p></div>
        <div className="bg-white p-4 rounded-lg shadow"><h3 className="text-sm font-medium text-gray-500">Available</h3><p className="mt-1 text-3xl font-semibold text-green-600">{availableRooms}</p></div>
        <div className="bg-white p-4 rounded-lg shadow"><h3 className="text-sm font-medium text-gray-500">Occupied</h3><p className="mt-1 text-3xl font-semibold text-red-600">{occupiedRooms}</p></div>
      </div>
      
      {isLoading && <p className="text-center text-gray-500">Loading rooms...</p>}
      {error && <p className="text-center text-red-500">Error: {error}</p>}

      {!isLoading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {rooms.map((room) => {
            const statusStyle = getStatusClasses(room.status);
            return (
              <div key={room.id} className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden transition-transform hover:scale-105 duration-300">
                <div className="p-5">
                  <div className="flex justify-between items-start">
                    <h2 className="text-xl font-bold text-gray-800">Room {room.room_number}</h2>
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}>
                      <span className={`w-2 h-2 mr-1.5 rounded-full ${statusStyle.dot}`}></span>
                      {room.status}
                    </div>
                  </div>
                  <p className="mt-4 text-3xl font-semibold text-gray-900">
                    ₱{Number(room.rate_per_month).toLocaleString()}
                    <span className="text-base font-normal text-gray-500">/month</span>
                  </p>
                  <div className="mt-6 border-t border-gray-200 pt-4">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                       <div className="flex items-center"><BedIcon className="h-5 w-5 mr-2 text-gray-400" /><span>Capacity: {room.capacity}</span></div>
                       <div className="flex items-center"><UsersIcon className="h-5 w-5 mr-2 text-gray-400" /><span>Occupant: None</span></div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-5 py-3">
                  <button className="w-full text-sm font-medium text-blue-600 hover:text-blue-800">View Details</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
