// src/app/dashboard/tenants/page.tsx
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import CreateTenantModal from '@/components/nav/CreateRoomTenant';
import TenantDetailsModal from '@/components/nav/TenantsDetailsModal';

// --- ICONS ---
const PhoneIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg> );
const EnvelopeIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg> );
const HomeIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h4.5m0 0v-7.5M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205l3 1m-3-1l-1.5.545m0 0l-1.5-1.09M21 12l-1.5-1.09m-1.5.545l-1.5-1.09M3 12l1.5-1.09m0 0l1.5.545m0 0l1.5 1.09M3 12l1.5-1.09" /></svg> );
const SearchIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg> );

// Tenant interface
interface Tenant {
  id: number;
  full_name: string;
  contact_number: string | null;
  email: string | null;
  room_number: string | null;
  registration_date: string;
  address: string;
  emergency_contact_name: string;
  emergency_contact_number: string;
}

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for modals
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  
  // NEW: State for search functionality
  const [searchTerm, setSearchTerm] = useState('');

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
 
  useEffect(() => {
    fetchTenants();
  }, [fetchTenants]);

  // NEW: Memoized filtering logic for search
  const filteredTenants = useMemo(() => {
    return tenants.filter(tenant =>
      tenant.full_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [tenants, searchTerm]);


  return (
    <div className="p-4 md:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <CreateTenantModal 
        isOpen={isCreateModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onTenantCreated={fetchTenants}
      />
      <TenantDetailsModal
        isOpen={selectedTenant !== null}
        onClose={() => setSelectedTenant(null)}
        tenant={selectedTenant}
        onTenantUpdated={fetchTenants}
      />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tenant Management</h1>
          <p className="mt-1 text-gray-600">A directory of all registered tenants.</p>
        </div>
        <button 
          onClick={() => setCreateModalOpen(true)}
          className="mt-4 md:mt-0 bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
        >
          + Register New Tenant
        </button>
      </div>
      
      {/* --- NEW: Search Bar and Summary Section --- */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
            <input 
                type="text"
                placeholder="Search by tenant name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            />
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border w-full md:w-auto text-center">
            <h3 className="text-sm font-medium text-gray-500">Total Tenants</h3>
            <p className="mt-1 text-3xl font-semibold text-gray-900">{tenants.length}</p>
        </div>
      </div>

      {isLoading && <p className="text-center text-gray-500 py-10">Loading tenants...</p>}
      {error && <p className="text-center text-red-600 py-10">Error: {error}</p>}
      
      {!isLoading && !error && (
        <div className="bg-white rounded-lg shadow border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-800">
              <thead className="text-xs font-semibold text-gray-600 uppercase bg-gray-100 border-b-2 border-gray-200">
                <tr>
                  <th scope="col" className="px-6 py-4">Full Name</th>
                  <th scope="col" className="px-6 py-4">Contact Info</th>
                  <th scope="col" className="px-6 py-4">Assigned Room</th>
                  <th scope="col" className="px-6 py-4">Registration Date</th>
                  <th scope="col" className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTenants.map((tenant) => (
                  <tr key={tenant.id} className="bg-white border-b hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-6 py-4 font-bold text-gray-900 whitespace-nowrap">{tenant.full_name}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2"><PhoneIcon className="h-4 w-4 text-gray-400" /><span>{tenant.contact_number || 'N/A'}</span></div>
                      <div className="flex items-center gap-2 mt-1 text-gray-600"><EnvelopeIcon className="h-4 w-4 text-gray-400" /><span>{tenant.email || 'N/A'}</span></div>
                    </td>
                    <td className="px-6 py-4">
                      {tenant.room_number ? (
                        <div className="flex items-center gap-2 font-semibold"><HomeIcon className="h-5 w-5 text-blue-600"/><span>Room {tenant.room_number}</span></div>
                      ) : (
                        <span className="text-gray-500 italic">Not Assigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{new Date(tenant.registration_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
                    <td className="px-6 py-4 text-center">
                      <button onClick={() => setSelectedTenant(tenant)} className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full hover:bg-blue-200">
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredTenants.length === 0 && (
                <div className="text-center p-8 text-gray-500">
                    <p>No tenants found.</p>
                </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
