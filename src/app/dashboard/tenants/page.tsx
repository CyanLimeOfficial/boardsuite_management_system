// src/app/dashboard/tenants/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import CreateTenantModal from '@/components/nav/CreateRoomTenant';

// --- ICONS ---
const PhoneIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg> );
const EnvelopeIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg> );
const HomeIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h4.5m0 0v-7.5M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205l3 1m-3-1l-1.5.545m0 0l-1.5-1.09M21 12l-1.5-1.09m-1.5.545l-1.5-1.09M3 12l1.5-1.09m0 0l1.5.545m0 0l1.5 1.09M3 12l1.5-1.09" /></svg> );

// Corrected Tenant interface to allow for nullable fields from the database
interface Tenant {
  id: number;
  full_name: string;
  contact_number: string | null;
  email: string | null;
  address: string | null;
  registration_date: string;
  emergency_contact_name: string | null;
  emergency_contact_number: string | null;
  room_number: string | null; // This comes from the JOIN in the API
}

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // The function to fetch tenant data from the API
  const fetchTenants = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('/api/dashboard/tenants');
      if (!response.ok) throw new Error('Failed to fetch tenants from the server.');
      const data = await response.json();
      setTenants(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);
 
  // Fetch the data when the component first loads
  useEffect(() => {
    fetchTenants();
  }, [fetchTenants]);

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-gray-50 min-h-screen">
      {/* Renders the modal and controls its visibility */}
      <CreateTenantModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onTenantCreated={fetchTenants} // Refreshes the list after a new tenant is added
      />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tenant Management</h1>
          <p className="mt-1 text-gray-600">
            A directory of all registered tenants.
          </p>
        </div>
        {/* This button now opens the modal */}
        <button 
          onClick={() => setIsModalOpen(true)}
          className="mt-4 md:mt-0 bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
        >
          + Register New Tenant
        </button>
      </div>

      {/* Conditional rendering for loading and error states */}
      {isLoading && <p className="text-center text-gray-500 py-10">Loading tenants...</p>}
      {error && <p className="text-center text-red-600 py-10">Error: {error}</p>}

      {/* The main table display */}
      {!isLoading && !error && (
        <div className="bg-white rounded-lg shadow border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full min-w-max text-sm text-left text-gray-800">
              <thead className="text-xs text-gray-700 uppercase bg-gray-100 border-b">
                <tr>
                  <th scope="col" className="px-6 py-3">Full Name</th>
                  <th scope="col" className="px-6 py-3">Contact Info</th>
                  <th scope="col" className="px-6 py-3">Assigned Room</th>
                  <th scope="col" className="px-6 py-3">Registration Date</th>
                  <th scope="col" className="px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {tenants.map((tenant) => (
                  <tr key={tenant.id} className="bg-white border-b hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                      {tenant.full_name}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <PhoneIcon className="h-4 w-4 text-gray-400" />
                        <span>{tenant.contact_number || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-gray-600">
                        <EnvelopeIcon className="h-4 w-4 text-gray-400" />
                        <span>{tenant.email || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {tenant.room_number ? (
                        <div className="flex items-center gap-2 font-semibold">
                          <HomeIcon className="h-5 w-5 text-blue-600"/>
                          <span>Room {tenant.room_number}</span>
                        </div>
                      ) : (
                        <span className="text-gray-500 italic">Not Assigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {new Date(tenant.registration_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <a href="#" className="font-medium text-blue-600 hover:underline">View Details</a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
