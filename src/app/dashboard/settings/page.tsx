// In file: app/dashboard/settings/page.tsx
'use client';

import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { Loader2, Building, KeyRound, User, Lock } from 'lucide-react';

// --- Type Definitions ---
interface FormData {
    boarding_house_name?: string;
    business_address?: string;
    contact_phone?: string;
    contact_email?: string;
    gemini_api_key?: string;
    // User fields
    full_name?: string;
    username?: string;
    new_password?: string;
    confirm_password?: string;
}

// --- Main Component ---
export default function SettingsPage() {
    const [formData, setFormData] = useState<FormData>({});
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    
    // --- Script & Data Loading ---
    useEffect(() => {
        // Dynamically load SweetAlert2 script
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/sweetalert2@11';
        document.body.appendChild(script);

        const fetchSettingsAndUser = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('authToken');
                const response = await fetch('/api/dashboard/settings', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) throw new Error('Failed to load settings and user data.');
                const data = await response.json();
                setFormData(data);
            } catch (err: any) {
                // @ts-ignore
                const Swal = (window as any).Swal;
                if (Swal) {
                    Swal.fire({
                        title: 'Error!',
                        text: err.message,
                        icon: 'error',
                        confirmButtonText: 'OK'
                    });
                } else {
                    alert(err.message);
                }
            } finally {
                setLoading(false);
            }
        };
        
        fetchSettingsAndUser();

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    // --- Handlers ---
    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSave = async (e: FormEvent) => {
        e.preventDefault();
        
        // @ts-ignore
        const Swal = (window as any).Swal;

        if (formData.new_password && formData.new_password !== formData.confirm_password) {
            Swal.fire({
                title: 'Password Mismatch',
                text: 'The new passwords do not match. Please try again.',
                icon: 'warning',
                confirmButtonText: 'OK'
            });
            return;
        }

        setIsSaving(true);
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch('/api/dashboard/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(formData)
            });
            
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to save settings.');
            }

            await Swal.fire({
                title: 'Success!',
                text: 'Settings have been saved successfully.',
                icon: 'success',
                timer: 2000,
                timerProgressBar: true,
                showConfirmButton: false
            });

            // Reload the page to ensure all components, including the header, refetch data.
            window.location.reload();
        } catch (err: any) {
            Swal.fire({
                title: 'Error!',
                text: err.message,
                icon: 'error',
                confirmButtonText: 'OK'
            });
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return <div className="p-8 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" /></div>;
    }

    // --- Render ---
    return (
        <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
            <header className="mb-8">
                <h1 className="text-4xl font-bold text-gray-800">System Settings</h1>
                <p className="text-lg text-gray-600">Manage your business, user account, and integrations.</p>
            </header>

            <form onSubmit={handleSave} className="space-y-12">
                {/* --- Business Information --- */}
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <h2 className="text-2xl font-semibold text-gray-700 mb-6 flex items-center"><Building className="mr-3 h-6 w-6 text-blue-500" />Business Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div><label className="block text-sm font-medium text-gray-700">Boarding House Name</label><input type="text" name="boarding_house_name" value={formData.boarding_house_name || ''} onChange={handleInputChange} className="mt-1 block w-full text-gray-900 border-gray-300 rounded-md shadow-sm"/></div>
                        <div><label className="block text-sm font-medium text-gray-700">Contact Phone</label><input type="tel" name="contact_phone" value={formData.contact_phone || ''} onChange={handleInputChange} className="mt-1 block w-full text-gray-900 border-gray-300 rounded-md shadow-sm"/></div>
                        <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700">Business Address</label><textarea name="business_address" value={formData.business_address || ''} onChange={handleInputChange} rows={2} className="mt-1 block w-full text-gray-900 border-gray-300 rounded-md shadow-sm"></textarea></div>
                        <div><label className="block text-sm font-medium text-gray-700">Contact Email</label><input type="email" name="contact_email" value={formData.contact_email || ''} onChange={handleInputChange} className="mt-1 block w-full text-gray-900 border-gray-300 rounded-md shadow-sm"/></div>
                    </div>
                </div>

                {/* --- User Account Management --- */}
                <div className="bg-white p-6 rounded-xl shadow-md">
                     <h2 className="text-2xl font-semibold text-gray-700 mb-6 flex items-center"><User className="mr-3 h-6 w-6 text-green-500" />User Account</h2>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div><label className="block text-sm font-medium text-gray-700">Full Name</label><input type="text" name="full_name" value={formData.full_name || ''} onChange={handleInputChange} className="mt-1 block w-full text-gray-900 border-gray-300 rounded-md shadow-sm"/></div>
                        <div><label className="block text-sm font-medium text-gray-700">Username</label><input type="text" name="username" value={formData.username || ''} readOnly className="mt-1 block w-full text-gray-900 bg-gray-100 border-gray-300 rounded-md shadow-sm cursor-not-allowed"/></div>
                        <div className="md:col-span-2"><hr/></div>
                        <div><label className="block text-sm font-medium text-gray-700 flex items-center gap-2"><Lock className="h-4 w-4"/>New Password</label><input type="password" name="new_password" placeholder="Leave blank to keep current password" onChange={handleInputChange} className="mt-1 block w-full text-gray-900 border-gray-300 rounded-md shadow-sm"/></div>
                        <div><label className="block text-sm font-medium text-gray-700">Confirm New Password</label><input type="password" name="confirm_password" placeholder="Confirm new password" onChange={handleInputChange} className="mt-1 block w-full text-gray-900 border-gray-300 rounded-md shadow-sm"/></div>
                     </div>
                </div>
                
                {/* --- API & Integrations --- */}
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <h2 className="text-2xl font-semibold text-gray-700 mb-6 flex items-center"><KeyRound className="mr-3 h-6 w-6 text-purple-500" />API & Integrations</h2>
                    <div><label className="block text-sm font-medium text-gray-700">Google AI (Gemini) API Key</label><input type="password" name="gemini_api_key" value={formData.gemini_api_key || ''} onChange={handleInputChange} className="mt-1 block w-full text-gray-900 border-gray-300 rounded-md shadow-sm"/></div>
                </div>

                <div className="flex justify-end pt-4">
                    <button type="submit" disabled={isSaving} className="bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 flex items-center justify-center disabled:bg-blue-300 transition-colors">
                        {isSaving && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                        {isSaving ? 'Saving...' : 'Save All Settings'}
                    </button>
                </div>
            </form>
        </div>
    );
}
