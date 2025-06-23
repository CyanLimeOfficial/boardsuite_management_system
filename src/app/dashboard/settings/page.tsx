// In file: app/dashboard/settings/page.tsx
'use client';

import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { Loader2, Building, Wallet, KeyRound } from 'lucide-react';

// --- Type Definitions ---
interface SettingsData {
    boarding_house_name: string;
    business_address: string;
    contact_phone: string;
    contact_email: string;
    currency_symbol: string;
    default_due_period: number;
    late_fees_enabled: boolean;
    late_fee_type: 'Fixed' | 'Percentage';
    late_fee_amount: number;
    payment_methods: string[];
    gemini_api_key: string;
}

// --- Main Component ---
export default function SettingsPage() {
    const [settings, setSettings] = useState<Partial<SettingsData>>({});
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // --- Data Fetching ---
    useEffect(() => {
        const fetchSettings = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('authToken');
                const response = await fetch('/api/dashboard/settings', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) throw new Error('Failed to load settings.');
                const data = await response.json();
                setSettings(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    // Dynamically load SweetAlert2 script
    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/sweetalert2@11';
        document.body.appendChild(script);
        return () => {
            document.body.removeChild(script);
        };
    }, []);

    // --- Handlers ---
    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        
        let processedValue: string | number | boolean = value;
        if (type === 'checkbox') {
            processedValue = (e.target as HTMLInputElement).checked;
        }
        if (type === 'number') {
            processedValue = parseFloat(value) || 0;
        }

        setSettings(prev => ({ ...prev, [name]: processedValue }));
    };

    const handlePaymentMethodsChange = (e: ChangeEvent<HTMLInputElement>) => {
        const methods = e.target.value.split(',').map(method => method.trim()).filter(Boolean);
        setSettings(prev => ({ ...prev, payment_methods: methods }));
    };

    const handleSave = async (e: FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        // @ts-ignore
        const Swal = (window as any).Swal;

        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch('/api/dashboard/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(settings)
            });
            
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to save settings.');
            }
            
            await Swal.fire({
                title: 'Success!',
                text: 'Settings have been saved successfully.',
                icon: 'success',
                confirmButtonText: 'OK',
                timer: 2000,
                timerProgressBar: true,
            });

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
                <p className="text-lg text-gray-600">Manage your business information, billing rules, and integrations.</p>
            </header>

            <form onSubmit={handleSave} className="space-y-12">
                {/* --- Section 1: General & Business Information --- */}
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <h2 className="text-2xl font-semibold text-gray-700 mb-6 flex items-center"><Building className="mr-3 h-6 w-6 text-blue-500" />Business Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div><label htmlFor="boarding_house_name" className="block text-sm font-medium text-gray-700">Boarding House Name</label><input type="text" name="boarding_house_name" value={settings.boarding_house_name || ''} onChange={handleInputChange} className="mt-1 block w-full text-gray-900 border-gray-300 rounded-md shadow-sm"/></div>
                        <div><label htmlFor="contact_phone" className="block text-sm font-medium text-gray-700">Contact Phone</label><input type="tel" name="contact_phone" value={settings.contact_phone || ''} onChange={handleInputChange} className="mt-1 block w-full text-gray-900 border-gray-300 rounded-md shadow-sm"/></div>
                        <div className="md:col-span-2"><label htmlFor="business_address" className="block text-sm font-medium text-gray-700">Business Address</label><textarea name="business_address" value={settings.business_address || ''} onChange={handleInputChange} rows={2} className="mt-1 block w-full text-gray-900 border-gray-300 rounded-md shadow-sm"></textarea></div>
                        <div><label htmlFor="contact_email" className="block text-sm font-medium text-gray-700">Contact Email</label><input type="email" name="contact_email" value={settings.contact_email || ''} onChange={handleInputChange} className="mt-1 block w-full text-gray-900 border-gray-300 rounded-md shadow-sm"/></div>
                        <div><label htmlFor="currency_symbol" className="block text-sm font-medium text-gray-700">Currency Symbol</label><input type="text" name="currency_symbol" value={settings.currency_symbol || 'PHP'} onChange={handleInputChange} className="mt-1 block w-full text-gray-900 border-gray-300 rounded-md shadow-sm"/></div>
                    </div>
                </div>

                {/* --- Section 2: Billing & Financial Settings --- */}
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <h2 className="text-2xl font-semibold text-gray-700 mb-6 flex items-center"><Wallet className="mr-3 h-6 w-6 text-green-500" />Billing & Financials</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div><label htmlFor="default_due_period" className="block text-sm font-medium text-gray-700">Default Due Period (Days)</label><input type="number" name="default_due_period" value={settings.default_due_period || 15} onChange={handleInputChange} className="mt-1 block w-full text-gray-900 border-gray-300 rounded-md shadow-sm"/></div>
                        <div className="flex items-center space-x-4 pt-6"><input type="checkbox" name="late_fees_enabled" checked={!!settings.late_fees_enabled} onChange={handleInputChange} className="h-5 w-5 text-blue-600 border-gray-300 rounded"/><label htmlFor="late_fees_enabled" className="text-sm font-medium text-gray-700">Enable Late Fees</label></div>
                        <div><label htmlFor="late_fee_type" className="block text-sm font-medium text-gray-700">Late Fee Type</label><select name="late_fee_type" value={settings.late_fee_type || 'Fixed'} onChange={handleInputChange} className="mt-1 block w-full text-gray-900 border-gray-300 rounded-md shadow-sm"><option>Fixed</option><option>Percentage</option></select></div>
                        <div><label htmlFor="late_fee_amount" className="block text-sm font-medium text-gray-700">Late Fee Amount</label><input type="number" step="0.01" name="late_fee_amount" value={settings.late_fee_amount || 0} onChange={handleInputChange} className="mt-1 block w-full text-gray-900 border-gray-300 rounded-md shadow-sm"/></div>
                        <div className="md:col-span-2"><label htmlFor="payment_methods" className="block text-sm font-medium text-gray-700">Accepted Payment Methods</label><input type="text" name="payment_methods" value={(settings.payment_methods || []).join(', ')} onChange={handlePaymentMethodsChange} className="mt-1 block w-full text-gray-900 border-gray-300 rounded-md shadow-sm"/><p className="text-xs text-gray-500 mt-1">Separate methods with a comma (e.g., Cash, GCash, Bank Transfer)</p></div>
                    </div>
                </div>
                
                 {/* --- Section 3: API & Integration Settings --- */}
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <h2 className="text-2xl font-semibold text-gray-700 mb-6 flex items-center"><KeyRound className="mr-3 h-6 w-6 text-purple-500" />API & Integrations</h2>
                    <div><label htmlFor="gemini_api_key" className="block text-sm font-medium text-gray-700">Google AI (Gemini) API Key</label><input type="password" name="gemini_api_key" value={settings.gemini_api_key || ''} onChange={handleInputChange} className="mt-1 block w-full text-gray-900 border-gray-300 rounded-md shadow-sm"/></div>
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
