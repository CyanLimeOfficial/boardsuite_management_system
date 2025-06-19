// components/CreateTenantModal.tsx
'use client';

import React, { useState, useEffect } from 'react';

// A new, simpler interface for the rooms dropdown
interface AvailableRoom {
  id: number;
  room_number: string;
}

interface CreateTenantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTenantCreated: () => void;
}

export default function CreateTenantModal({ isOpen, onClose, onTenantCreated }: CreateTenantModalProps) {
  // State for form fields
  const [fullName, setFullName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyNumber, setEmergencyNumber] = useState('');
  
  // New state for handling the rooms dropdown
  const [availableRooms, setAvailableRooms] = useState<AvailableRoom[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [isFetchingRooms, setIsFetchingRooms] = useState(false);
  
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // This effect runs when the modal is opened
  useEffect(() => {
    if (isOpen) {
      const fetchAvailableRooms = async () => {
        setIsFetchingRooms(true);
        try {
          const response = await fetch('/api/dashboard/rooms?status=Available');
          if (!response.ok) throw new Error('Could not fetch available rooms.');
          
          const data = await response.json();
          setAvailableRooms(data);
        } catch (err: any) {
          console.error(err);
        } finally {
          setIsFetchingRooms(false);
        }
      };
      fetchAvailableRooms();
    }
  }, [isOpen]); // It re-runs every time the modal opens

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/dashboard/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName,
          contact_number: contactNumber,
          email: email,
          address: address,
          emergency_contact_name: emergencyName,
          emergency_contact_number: emergencyNumber,
          room_id: selectedRoomId || null, // Pass the selected ID or null
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to register tenant.');
      
      onTenantCreated();
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
          <h2 className="text-2xl font-bold text-gray-900">Register New Tenant</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-black text-2xl">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information Section */}
          <fieldset><legend className="text-lg font-medium text-gray-900 border-b pb-2 mb-4 w-full">Personal Information</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label htmlFor="fullName" className="block text-sm font-medium text-gray-900">Full Name</label><input type="text" id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900"/></div>
              <div><label htmlFor="contactNumber" className="block text-sm font-medium text-gray-900">Contact Number</label><input type="tel" id="contactNumber" value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900"/></div>
              <div className="md:col-span-2"><label htmlFor="email" className="block text-sm font-medium text-gray-900">Email Address</label><input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900"/></div>
              <div className="md:col-span-2"><label htmlFor="address" className="block text-sm font-medium text-gray-900">Address</label><textarea id="address" value={address} onChange={(e) => setAddress(e.target.value)} rows={2} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900"></textarea></div>
            </div>
          </fieldset>
          
          {/* Emergency Contact Section */}
          <fieldset><legend className="text-lg font-medium text-gray-900 border-b pb-2 mb-4 w-full">Emergency Contact</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label htmlFor="emergencyName" className="block text-sm font-medium text-gray-900">Full Name</label><input type="text" id="emergencyName" value={emergencyName} onChange={(e) => setEmergencyName(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900"/></div>
              <div><label htmlFor="emergencyNumber" className="block text-sm font-medium text-gray-900">Contact Number</label><input type="tel" id="emergencyNumber" value={emergencyNumber} onChange={(e) => setEmergencyNumber(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900"/></div>
            </div>
          </fieldset>

          {/* Room Assignment Section */}
          <fieldset><legend className="text-lg font-medium text-gray-900 border-b pb-2 mb-4 w-full">Assign to Room</legend>
            <div>
              <label htmlFor="room" className="block text-sm font-medium text-gray-900">Available Rooms (Optional)</label>
              <select id="room" value={selectedRoomId} onChange={(e) => setSelectedRoomId(e.target.value)} disabled={isFetchingRooms} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900">
                <option value="">{isFetchingRooms ? 'Loading rooms...' : 'Do not assign a room'}</option>
                {availableRooms.map(room => (<option key={room.id} value={room.id}>Room {room.room_number}</option>))}
              </select>
            </div>
          </fieldset>

          {error && <p className="mt-4 text-sm text-center text-red-600 bg-red-100 p-3 rounded-md">{error}</p>}
          
          <div className="mt-6 flex justify-end space-x-3 border-t pt-4">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="bg-gray-200 text-gray-900 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-blue-300">
                {isSubmitting ? 'Registering...' : 'Register Tenant'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
