// components/TenantDetailsModal.tsx
'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import { Tenant } from '@/models';

// A simple interface for the rooms dropdown
interface AvailableRoom {
    id: number;
    room_number: string;
}

interface TenantDetailsModalProps {
  tenant: Tenant | null;
  isOpen: boolean;
  onClose: () => void;
  onTenantUpdated: () => void;
}

export default function TenantDetailsModal({ tenant, isOpen, onTenantUpdated, onClose }: TenantDetailsModalProps) {
  // State for the form fields, assuming Tenant might have last_payment_date
  const [formData, setFormData] = useState<Partial<Tenant & { last_payment_date?: string }>>(tenant || {});
  // State for the relocation dropdown
  const [availableRooms, setAvailableRooms] = useState<AvailableRoom[]>([]);
  const [newRoomId, setNewRoomId] = useState('');
  
  // General UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // This effect resets the form and fetches available rooms when the modal opens
  useEffect(() => {
    if (isOpen && tenant) {
      setFormData(tenant);
      setError(null);
      setNewRoomId('');

      const fetchAvailableRooms = async () => {
        try {
          const token = localStorage.getItem('authToken');
          const response = await fetch('/api/dashboard/rooms/available', { headers: { 'Authorization': `Bearer ${token}` } });
          const data = await response.json();
          if (!response.ok) throw new Error(data.message);
          setAvailableRooms(data);
        } catch (err: any) {
          setError(err.message);
        }
      };
      fetchAvailableRooms();
    }
  }, [isOpen, tenant]);

  if (!isOpen || !tenant) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // --- ACTION HANDLERS ---

  const handleUpdateDetails = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/dashboard/tenants/${tenant.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      onTenantUpdated();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRelocate = async () => {
    if (!newRoomId) return setError('Please select a new room.');
    setIsSubmitting(true);
    setError(null);
    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`/api/dashboard/tenants/${tenant.id}/relocate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`},
            body: JSON.stringify({ newRoomId: newRoomId }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        onTenantUpdated();
        onClose();
    } catch (err: any) {
        setError(err.message);
    } finally {
        setIsSubmitting(false);
    }
  };

  // New handler to mark tenant as paid
  const handleMarkAsPaid = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
        const token = localStorage.getItem('authToken');
        // This new API endpoint should handle updating the tenant's last_payment_date to the current date on the server
        const response = await fetch(`/api/dashboard/tenants/${tenant.id}/mark-paid`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to update payment status.');
        onTenantUpdated();
        onClose();
    } catch (err: any) {
        setError(err.message);
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Tenant: {formData.full_name}</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-black text-2xl">&times;</button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Side: Actions */}
          <div className="lg:col-span-1 p-4 bg-gray-50 rounded-lg space-y-6 h-fit">
            
            {/* Room Assignment Section */}
            <div>
                <h3 className="font-semibold text-gray-800 border-b pb-2 mb-2">Room Assignment</h3>
                <div>
                    <p className="text-sm font-medium text-gray-600">Current Room</p>
                    <p className="font-bold text-lg text-blue-600">{formData.room_number ? `Room ${formData.room_number}` : 'Not Assigned'}</p>
                </div>
            </div>

            {/* Payment Status Section */}
            <div>
                <h3 className="font-semibold text-gray-800 border-b pb-2 mb-2">Payment Status</h3>
                 <div>
                    <p className="text-sm font-medium text-gray-600">Last Payment Date</p>
                    <p className="font-bold text-lg text-green-600">
                        {formData.last_payment_date ? new Date(formData.last_payment_date).toLocaleDateString() : 'No payment recorded'}
                    </p>
                </div>
                <button onClick={handleMarkAsPaid} disabled={isSubmitting} className="w-full mt-2 bg-emerald-600 text-white font-semibold py-2 px-3 rounded-lg hover:bg-emerald-700 disabled:bg-gray-300">
                    {isSubmitting ? 'Processing...' : 'Mark as Paid Today'}
                </button>
            </div>

            {/* Relocate Section */}
            <div>
              <h3 className="font-semibold text-gray-800 border-b pb-2 mb-2">Relocate Tenant</h3>
              <label htmlFor="relocate" className="block text-sm font-medium text-gray-900">Move to New Room</label>
              <div className="mt-1">
                <select id="relocate" value={newRoomId} onChange={(e) => setNewRoomId(e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm text-gray-900">
                  <option value="">Select an available room...</option>
                  {availableRooms.map(r => (<option key={r.id} value={r.id}>Room {r.room_number}</option>))}
                </select>
              </div>
              <button onClick={handleRelocate} disabled={!newRoomId || isSubmitting} className="w-full mt-2 bg-blue-600 text-white font-semibold py-2 px-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-300">Move Tenant</button>
            </div>
          </div>

          {/* Right Side: Edit Details Form */}
          <form onSubmit={handleUpdateDetails} className="lg:col-span-2 space-y-6">
            <div>
                <h3 className="font-semibold text-gray-800 border-b pb-2">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div><label htmlFor="full_name" className="block text-sm font-medium text-gray-900">Full Name</label><input type="text" name="full_name" value={formData.full_name || ''} onChange={handleInputChange} required className="mt-1 block w-full text-gray-900"/></div>
                    <div><label htmlFor="contact_number" className="block text-sm font-medium text-gray-900">Contact Number</label><input type="tel" name="contact_number" value={formData.contact_number || ''} onChange={handleInputChange} className="mt-1 block w-full text-gray-900"/></div>
                    <div className="md:col-span-2"><label htmlFor="email" className="block text-sm font-medium text-gray-900">Email</label><input type="email" name="email" value={formData.email || ''} onChange={handleInputChange} className="mt-1 block w-full text-gray-900"/></div>
                    <div className="md:col-span-2"><label htmlFor="address" className="block text-sm font-medium text-gray-900">Address</label><textarea name="address" value={formData.address || ''} onChange={handleInputChange} rows={2} className="mt-1 block w-full text-gray-900"></textarea></div>
                </div>
            </div>
            <div>
                <h3 className="font-semibold text-gray-800 border-b pb-2">Emergency Contact</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div><label htmlFor="emergency_contact_name" className="block text-sm font-medium text-gray-900">Contact Name</label><input type="text" name="emergency_contact_name" value={formData.emergency_contact_name || ''} onChange={handleInputChange} className="mt-1 block w-full text-gray-900"/></div>
                    <div><label htmlFor="emergency_contact_number" className="block text-sm font-medium text-gray-900">Contact Number</label><input type="tel" name="emergency_contact_number" value={formData.emergency_contact_number || ''} onChange={handleInputChange} className="mt-1 block w-full text-gray-900"/></div>
                </div>
            </div>
            
            {error && <p className="text-sm text-center text-red-600 bg-red-100 p-3 rounded-md">{error}</p>}
            
            <div className="flex justify-end pt-2">
                <button type="submit" disabled={isSubmitting} className="bg-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-700 disabled:bg-green-300">
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
