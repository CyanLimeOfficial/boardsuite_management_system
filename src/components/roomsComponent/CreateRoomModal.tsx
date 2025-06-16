// components/CreateRoomModal.tsx
'use client';

import React, { useState } from 'react';

// Define the props the component will accept
interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRoomCreated: () => void; // A function to call to refresh the room list
}

export default function CreateRoomModal({ isOpen, onClose, onRoomCreated }: CreateRoomModalProps) {
  // State for form inputs
  const [roomNumber, setRoomNumber] = useState('');
  const [description, setDescription] = useState('');
  const [capacity, setCapacity] = useState('1');
  const [rate, setRate] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Don't render the modal if it's not open
  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/dashboard/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          room_number: roomNumber,
          description: description,
          capacity: parseInt(capacity, 10),
          rate_per_month: parseFloat(rate),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create room.');
      }
      
      onRoomCreated(); // Call the function to refresh the list on the main page
      onClose(); // Close the modal

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    // The Modal container
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Create New Room</h2>
            <button onClick={onClose} className="text-gray-600 hover:text-black text-2xl">&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="roomNumber" className="block text-sm font-medium text-gray-900">Room Number</label>
              <input type="text" id="roomNumber" value={roomNumber} onChange={(e) => setRoomNumber(e.target.value)} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900" />
            </div>
            <div>
              <label htmlFor="capacity" className="block text-sm font-medium text-gray-900">Capacity</label>
              <input type="number" id="capacity" min="1" value={capacity} onChange={(e) => setCapacity(e.target.value)} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900" />
            </div>
            <div>
              <label htmlFor="rate" className="block text-sm font-medium text-gray-900">Rate per Month (₱)</label>
              <input type="number" id="rate" min="0" step="0.01" value={rate} onChange={(e) => setRate(e.target.value)} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900" />
            </div>
             <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-900">Description (Optional)</label>
              <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"></textarea>
            </div>
          </div>

          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
          
          <div className="mt-6 flex justify-end space-x-3">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="bg-gray-200 text-gray-900 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-blue-300">
                {isSubmitting ? 'Creating...' : 'Create Room'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
