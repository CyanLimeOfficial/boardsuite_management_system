// In file: app/dashboard/reports/page.tsx
'use client';

import React, { useState, useEffect, FormEvent, ChangeEvent, useCallback } from 'react';
import { Upload, FileText, Loader2, AlertTriangle, Wand2, Calendar, DollarSign, Hourglass } from 'lucide-react';

// --- Type Definitions ---
interface Payment {
    id: number;
    tenant_name: string;
    amount_paid: number;
    payment_date: string;
}

interface PendingBill {
    id: number;
    tenant_name: string;
    amount_due: number;
    due_date: string;
    status: string;
}

interface ReportData {
    monthlySales: number;
    totalPending: number;
    payments: Payment[];
    pendingBills: PendingBill[];
}

interface ExtractedData {
    tenantName: string | null;
    amountPaid: number | null;
    paymentDate: string | null;
    paymentMethod: string | null;
    notes: string | null;
}

// --- Main Component ---
export default function ReportsPage() {
    // State for financial reports
    const [reportData, setReportData] = useState<ReportData | null>(null);
    const [reportLoading, setReportLoading] = useState(true);
    const [reportError, setReportError] = useState<string | null>(null);
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // Defaults to current month, e.g., "2025-06"

    // State for image extractor
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imageBase64, setImageBase64] = useState<string | null>(null);
    const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
    const [extractionLoading, setExtractionLoading] = useState(false);
    const [extractionError, setExtractionError] = useState<string | null>(null);
    
    // --- Data Fetching for Reports ---
    const fetchReportData = useCallback(async (year: string, month: string) => {
        setReportLoading(true);
        setReportError(null);
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`/api/dashboard/reports?year=${year}&month=${month}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to fetch report data.');
            const data = await response.json();
            setReportData(data);
        } catch (err: any) {
            setReportError(err.message);
        } finally {
            setReportLoading(false);
        }
    }, []);

    useEffect(() => {
        const [year, month] = selectedMonth.split('-');
        fetchReportData(year, month);
    }, [selectedMonth, fetchReportData]);

    // --- Handlers ---
    const handleMonthChange = (e: ChangeEvent<HTMLInputElement>) => {
        setSelectedMonth(e.target.value);
    };

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setExtractionError(null);
            setExtractedData(null);
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setImageBase64(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleExtraction = async (event: FormEvent) => {
        event.preventDefault();
        if (!imageFile || !imageBase64) {
            setExtractionError("Please select an image file first.");
            return;
        }

        setExtractionLoading(true);
        setExtractionError(null);
        setExtractedData(null);
        
        const pureBase64 = imageBase64.split(',')[1];
        
        try {
            const prompt = "You are a data entry assistant. Analyze this payment receipt. Extract the following details in a strict JSON format: tenantName (string, if present), amountPaid (number), paymentDate (string, YYYY-MM-DD format), paymentMethod (string), and notes (string, for reference numbers).";
            const payload = {
                contents: [{ role: "user", parts: [{ text: prompt }, { inlineData: { mimeType: imageFile.type, data: pureBase64 } }] }],
                generationConfig: {
                    responseMimeType: "application/json",
                    responseSchema: { type: "OBJECT", properties: { "tenantName": { "type": "STRING" }, "amountPaid": { "type": "NUMBER" }, "paymentDate": { "type": "STRING", "description": "Date in YYYY-MM-DD format" }, "paymentMethod": { "type": "STRING" }, "notes": { "type": "STRING" } } }
                }
            };
            const apiKey = "";
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
            const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || "AI model error.");
            }
            const result = await response.json();
            if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
                setExtractedData(JSON.parse(result.candidates[0].content.parts[0].text));
            } else {
                throw new Error("The AI did not return valid data. Please try another image.");
            }
        } catch (err: any) {
            setExtractionError(err.message);
        } finally {
            setExtractionLoading(false);
        }
    };

    const formatCurrency = (amount: number) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount);

    return (
        <div className="p-4 md:p-8 bg-gray-50 min-h-screen space-y-8">
            <header>
                <h1 className="text-4xl font-bold text-gray-800">Reports & Tools</h1>
                <p className="text-lg text-gray-600">Analyze financial performance and use tools for quick data entry.</p>
            </header>

            {/* --- Monthly Financial Report Section --- */}
            <div className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                    <h2 className="text-2xl font-semibold text-gray-700">Monthly Financial Report</h2>
                    <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-gray-500" />
                        <input
                            type="month"
                            value={selectedMonth}
                            onChange={handleMonthChange}
                            className="p-2 border border-gray-300 rounded-lg text-gray-900"
                        />
                    </div>
                </div>

                {reportLoading && <div className="text-center py-4"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>}
                {reportError && <div className="text-center py-4 text-red-600">{reportError}</div>}
                {reportData && !reportLoading && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div className="bg-blue-50 p-4 rounded-lg flex items-center gap-4">
                                <div className="bg-blue-200 p-3 rounded-full"><DollarSign className="h-6 w-6 text-blue-600"/></div>
                                <div>
                                    <p className="text-sm text-blue-800">Sales for {new Date(selectedMonth+'-02').toLocaleString('default', { month: 'long' })}</p>
                                    <p className="text-2xl font-bold text-blue-900">{formatCurrency(reportData.monthlySales)}</p>
                                </div>
                            </div>
                            <div className="bg-orange-50 p-4 rounded-lg flex items-center gap-4">
                                <div className="bg-orange-200 p-3 rounded-full"><Hourglass className="h-6 w-6 text-orange-600"/></div>
                                <div>
                                    <p className="text-sm text-orange-800">Total Pending Dues</p>
                                    <p className="text-2xl font-bold text-orange-900">{formatCurrency(reportData.totalPending)}</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div>
                                <h3 className="text-xl font-semibold text-gray-700 mb-4">Payments This Month</h3>
                                <div className="overflow-auto max-h-96 rounded-lg border">
                                    <table className="min-w-full text-sm">
                                        <thead className="bg-gray-100 sticky top-0"><tr className="text-left"><th className="p-3">Tenant</th><th className="p-3">Amount</th><th className="p-3">Date</th></tr></thead>
                                        <tbody>{reportData.payments.map(p => (<tr key={p.id} className="border-t"><td className="p-3">{p.tenant_name}</td><td className="p-3 text-green-600 font-medium">{formatCurrency(p.amount_paid)}</td><td className="p-3">{new Date(p.payment_date).toLocaleDateString()}</td></tr>))}</tbody>
                                    </table>
                                    {reportData.payments.length === 0 && <p className="p-4 text-center text-gray-500">No payments recorded for this month.</p>}
                                </div>
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-gray-700 mb-4">All Pending Bills</h3>
                                 <div className="overflow-auto max-h-96 rounded-lg border">
                                    <table className="min-w-full text-sm">
                                        <thead className="bg-gray-100 sticky top-0"><tr className="text-left"><th className="p-3">Tenant</th><th className="p-3">Amount Due</th><th className="p-3">Status</th></tr></thead>
                                        <tbody>{reportData.pendingBills.map(b => (<tr key={b.id} className="border-t"><td className="p-3">{b.tenant_name}</td><td className="p-3 text-red-600 font-medium">{formatCurrency(b.amount_due)}</td><td className="p-3">{b.status}</td></tr>))}</tbody>
                                    </table>
                                     {reportData.pendingBills.length === 0 && <p className="p-4 text-center text-gray-500">No pending bills.</p>}
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
            
            {/* --- AI Image Extractor Section --- */}
            <div className="bg-white p-6 rounded-xl shadow-md">
                 <h2 className="text-2xl font-semibold text-gray-700 mb-4">AI Data Extractor</h2>
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                        <h3 className="font-semibold text-gray-600 mb-2 flex items-center"><Upload className="mr-2 h-5 w-5"/>1. Upload Receipt Image</h3>
                        <form onSubmit={handleExtraction}>
                            <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                                <input type="file" id="file-upload" className="hidden" accept="image/*" onChange={handleFileChange} />
                                <label htmlFor="file-upload" className="cursor-pointer font-medium text-blue-600">{imageFile ? `${imageFile.name}` : 'Choose a file'}</label>
                            </div>
                            <button type="submit" disabled={!imageFile || extractionLoading} className="w-full mt-4 bg-blue-600 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center disabled:bg-blue-300">
                                {extractionLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin"/> : <Wand2 className="mr-2 h-5 w-5"/>}
                                {extractionLoading ? 'Analyzing...' : 'Extract Details'}
                            </button>
                        </form>
                    </div>
                     <div>
                        <h3 className="font-semibold text-gray-600 mb-2 flex items-center"><FileText className="mr-2 h-5 w-5"/>2. Extracted Information</h3>
                         <div className="mt-2 space-y-2">
                            {extractionLoading && <div className="text-center py-6"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>}
                            {extractionError && <div className="p-3 bg-red-50 text-red-700 rounded-lg">{extractionError}</div>}
                            {extractedData && (<div className="space-y-2 p-4 bg-gray-50 rounded-lg">{Object.entries(extractedData).map(([key, value]) => (<div key={key}><p className="text-xs text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1')}</p><p className="font-medium text-gray-900">{value?.toString() || 'N/A'}</p></div>))}</div>)}
                            {!extractionLoading && !extractionError && !extractedData && <div className="text-center text-gray-400 py-6">Results will appear here.</div>}
                        </div>
                    </div>
                 </div>
            </div>
        </div>
    );
}
