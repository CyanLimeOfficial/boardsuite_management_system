// components/RoomDetailsModal.tsx
'use client';

import React, { useState, useEffect, FormEvent } from 'react';

// Define the shape of a Room object, matching the main page
interface Room {
  id: number;
  room_number: string;
  description: string | null;
  status: 'Available' | 'Occupied' | 'Under Maintenance';
  capacity: number;
  rate_per_month: number;
  occupant_name: string | null;
}

// Define the props the modal component accepts
interface RoomDetailsModalProps {
  room: Room | null;
  isOpen: boolean;
  onClose: () => void;
  onRoomUpdated: () => void;
  onRoomDeleted: () => void;
}

export default function RoomDetailsModal({ room, isOpen, onClose, onRoomUpdated, onRoomDeleted }: RoomDetailsModalProps) {
  const [formData, setFormData] = useState(room);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  useEffect(() => {
    setFormData(room);
    setIsConfirmingDelete(false);
    setError(null);
  }, [room]);

  if (!isOpen || !formData) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const updatedValue = (name === 'capacity' || name === 'rate_per_month') ? parseFloat(value) || 0 : value;
    setFormData(prev => prev ? { ...prev, [name]: updatedValue } : null);
  };

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Authentication required.');

      const response = await fetch(`/api/dashboard/rooms/${formData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`},
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to update room.');

      onRoomUpdated();
      onClose();

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => { /* ... existing delete logic ... */ };

  // --- NEW: Function to handle removing an occupant ---
  const handleRemoveOccupant = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
        const token = localStorage.getItem('authToken');
        if (!token) throw new Error('Authentication required.');

        const response = await fetch(`/api/dashboard/rooms/${formData.id}/unassign`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to remove occupant.');

        onRoomUpdated();
        onClose();

    } catch (err: any) {
        setError(err.message);
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Room {room?.room_number}</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-black text-2xl">&times;</button>
        </div>

        {/* --- NEW: Occupant Information Section --- */}
        <div className="mb-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold text-gray-800">Current Occupant</h3>
            {formData.occupant_name ? (
                <div className="flex items-center justify-between mt-2">
                    <p className="text-gray-900">{formData.occupant_name}</p>
                    <button onClick={handleRemoveOccupant} disabled={isSubmitting} className="text-sm bg-orange-100 text-orange-700 font-semibold py-1 px-3 rounded-lg hover:bg-orange-200">
                        Remove Occupant
                    </button>
                </div>
            ) : (
                <p className="text-gray-500 italic mt-1">This room is available.</p>
            )}
        </div>

        {/* --- Edit Form --- */}
        <form onSubmit={handleUpdate} className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Edit Room Information</h3>
            <div><label htmlFor="room_number" className="block text-sm font-medium text-gray-900">Room Number</label><input type="text" name="room_number" value={formData.room_number} onChange={handleInputChange} required className="mt-1 block w-full text-gray-900"/></div>
            <div><label htmlFor="capacity" className="block text-sm font-medium text-gray-900">Capacity</label><input type="number" name="capacity" value={formData.capacity} onChange={handleInputChange} required className="mt-1 block w-full text-gray-900"/></div>
            <div><label htmlFor="rate_per_month" className="block text-sm font-medium text-gray-900">Rate per Month (₱)</label><input type="number" name="rate_per_month" value={formData.rate_per_month} onChange={handleInputChange} required className="mt-1 block w-full text-gray-900"/></div>
            <div><label htmlFor="status" className="block text-sm font-medium text-gray-900">Status</label><select name="status" value={formData.status} onChange={handleInputChange} required className="mt-1 block w-full text-gray-900"><option value="Available">Available</option><option value="Occupied">Occupied</option><option value="Under Maintenance">Under Maintenance</option></select></div>
            <div><label htmlFor="description" className="block text-sm font-medium text-gray-900">Description</label><textarea name="description" value={formData.description || ''} onChange={handleInputChange} rows={3} className="mt-1 block w-full text-gray-900"></textarea></div>
          
            {error && <p className="mt-4 text-sm text-center text-red-600 bg-red-100 p-3 rounded-md">{error}</p>}

            <div className="mt-6 flex justify-between items-center border-t pt-4">
                {/* ... existing delete room button ... */}
                <button type="submit" disabled={isSubmitting} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-blue-300">
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </form>
      </div>
    </div>
  );
}
