// app/dashboard/payments/page.tsx
'use client';

import React, { useState, useEffect, useCallback, FormEvent } from 'react';

// --- Type Definitions ---
interface Bill {
    id: number;
    tenant_id: number;
    tenant_name: string;
    room_number: string;
    amount_due: number | string; 
    bill_date: string;
    due_date: string;
    status: 'Pending' | 'Paid' | 'Partially Paid' | 'Overdue';
}

interface PaymentFormData {
    bill_id: number | null;
    amount_paid: string;
    payment_date: string;
    payment_method: 'Cash' | 'Bank Transfer' | 'GCash' | 'Card' | 'Other';
    notes: string;
}

// --- Main Component ---
export default function BillingPage() {
    const [bills, setBills] = useState<Bill[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
    const [paymentFormData, setPaymentFormData] = useState<PaymentFormData>({
        bill_id: null,
        amount_paid: '',
        payment_date: new Date().toISOString().split('T')[0],
        payment_method: 'Cash',
        notes: ''
    });

    const fetchBills = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch('/api/dashboard/payments', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to fetch bills.');
            setBills(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBills();
    }, [fetchBills]);

    const handleGenerateBills = async () => {
        if (!confirm('Are you sure you want to generate bills for all due tenants?')) {
            return;
        }
        setIsGenerating(true);
        setError(null);
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch('/api/dashboard/payments/generate', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to generate bills.');
            alert(data.message);
            await fetchBills();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsGenerating(false);
        }
    };
    
    const handleRecordPaymentSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!paymentFormData.bill_id || !paymentFormData.amount_paid) return;

        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch('/api/dashboard/payments/payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(paymentFormData)
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to record payment.');
            
            alert('Payment recorded successfully!');
            closeModal();
            await fetchBills();

        } catch (err: any) {
             alert(`Error: ${err.message}`);
        }
    };

    const openModal = (bill: Bill) => {
        setSelectedBill(bill);
        setPaymentFormData({
            bill_id: bill.id,
            amount_paid: bill.amount_due.toString(),
            payment_date: new Date().toISOString().split('T')[0],
            payment_method: 'Cash',
            notes: ''
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedBill(null);
    };

    return (
        <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
            <header className="mb-8">
                <h1 className="text-4xl font-bold text-gray-800">Payments & Billing</h1>
                <p className="text-lg text-gray-600">A history of all payments and pending bills will be here.</p>
            </header>

            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-6" role="alert">{error}</div>}

            <div className="mb-8 p-6 bg-white rounded-xl shadow-md">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">Billing Actions</h2>
                <button
                    onClick={handleGenerateBills}
                    disabled={isGenerating}
                    className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:bg-blue-300 transition-colors"
                >
                    {isGenerating ? 'Generating...' : 'Generate Due Bills'}
                </button>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="p-6">
                    <h2 className="text-2xl font-semibold text-gray-700">Billing History</h2>
                </div>
                {loading ? (
                    <p className="p-6 text-center text-gray-500">Loading bills...</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left">
                            <thead className="bg-gray-100 border-b">
                                <tr>
                                    <th className="px-6 py-3 text-sm font-semibold text-gray-600 uppercase">Tenant</th>
                                    <th className="px-6 py-3 text-sm font-semibold text-gray-600 uppercase">Room</th>
                                    <th className="px-6 py-3 text-sm font-semibold text-gray-600 uppercase">Amount Due</th>
                                    <th className="px-6 py-3 text-sm font-semibold text-gray-600 uppercase">Bill Date</th>
                                    <th className="px-6 py-3 text-sm font-semibold text-gray-600 uppercase">Status</th>
                                    <th className="px-6 py-3 text-sm font-semibold text-gray-600 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Array.isArray(bills) && bills.map(bill => (
                                    <tr key={bill.id} className="border-b hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-gray-800">{bill.tenant_name}</td>
                                        <td className="px-6 py-4 text-gray-600">{bill.room_number}</td>
                                        <td className="px-6 py-4 text-gray-800">₱{parseFloat(bill.amount_due as string).toFixed(2)}</td>
                                        <td className="px-6 py-4 text-gray-600">{new Date(bill.bill_date).toLocaleDateString()}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                                bill.status === 'Paid' ? 'bg-green-100 text-green-800' :
                                                bill.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'
                                            }`}>
                                                {bill.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button 
                                                onClick={() => openModal(bill)}
                                                disabled={bill.status === 'Paid'}
                                                className="bg-green-500 text-white font-bold py-1 px-3 rounded-md hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
                                            >
                                                Record Payment
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            
            {isModalOpen && selectedBill && (
                <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
                        <form onSubmit={handleRecordPaymentSubmit}>
                            <div className="p-6">
                                <h3 className="text-2xl font-bold text-gray-800 mb-2">Record Payment</h3>
                                <p className="text-gray-600 mb-6">For Bill #{selectedBill.id} ({selectedBill.tenant_name})</p>
                                
                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="amount_paid" className="block text-sm font-medium text-gray-700">Amount Paid</label>
                                        {/* --- STYLE FIX APPLIED HERE --- */}
                                        <input type="number" id="amount_paid" value={paymentFormData.amount_paid} onChange={e => setPaymentFormData({...paymentFormData, amount_paid: e.target.value})} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm text-gray-900"/>
                                    </div>
                                     <div>
                                        <label htmlFor="payment_date" className="block text-sm font-medium text-gray-700">Payment Date</label>
                                        <input type="date" id="payment_date" value={paymentFormData.payment_date} onChange={e => setPaymentFormData({...paymentFormData, payment_date: e.target.value})} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm text-gray-900"/>
                                    </div>
                                    <div>
                                        <label htmlFor="payment_method" className="block text-sm font-medium text-gray-700">Payment Method</label>
                                        <select id="payment_method" value={paymentFormData.payment_method} onChange={e => setPaymentFormData({...paymentFormData, payment_method: e.target.value as any})} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm text-gray-900">
                                            <option>Cash</option>
                                            <option>Bank Transfer</option>
                                            <option>GCash</option>
                                            <option>Card</option>
                                            <option>Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes (Optional)</label>
                                        <textarea id="notes" value={paymentFormData.notes} onChange={e => setPaymentFormData({...paymentFormData, notes: e.target.value})} rows={2} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm text-gray-900"></textarea>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3 rounded-b-xl">
                                <button type="button" onClick={closeModal} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300">Cancel</button>
                                <button type="submit" className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700">Save Payment</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
