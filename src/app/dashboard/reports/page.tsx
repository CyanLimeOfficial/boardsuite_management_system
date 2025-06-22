// In file: app/dashboard/reports/page.tsx
'use client';

import React, { useState, useEffect, useCallback, ChangeEvent } from 'react';
import { Calendar, DollarSign, Hourglass, Download, Loader2, Wand2 } from 'lucide-react';

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

// --- Main Component ---
export default function ReportsPage() {
    const [reportData, setReportData] = useState<ReportData | null>(null);
    const [reportLoading, setReportLoading] = useState(true);
    const [reportError, setReportError] = useState<string | null>(null);
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
    
    const [aiSummary, setAiSummary] = useState<string | null>(null);
    const [summaryLoading, setSummaryLoading] = useState(false);
    const [summaryError, setSummaryError] = useState<string | null>(null);

    const [scriptsLoaded, setScriptsLoaded] = useState(false);

    // --- Dynamic Script Loading ---
    useEffect(() => {
        const loadScript = (src: string) => {
            return new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = src;
                script.onload = resolve;
                script.onerror = reject;
                document.body.appendChild(script);
            });
        };

        Promise.all([
            loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'),
            loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js')
        ]).then(() => setScriptsLoaded(true))
          .catch(() => setReportError("Failed to load PDF generation scripts."));
    }, []);
    
    // --- Data Fetching ---
    const fetchReportData = useCallback(async (year: string, month: string) => {
        setReportLoading(true);
        setReportError(null);
        setAiSummary(null); // Reset summary when month changes
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
    const handleGenerateSummary = async () => {
        if (!reportData) return;
        setSummaryLoading(true);
        setSummaryError(null);
        try {
            const reportMonth = new Date(selectedMonth+'-02').toLocaleString('default', { month: 'long', year: 'numeric' });
            const token = localStorage.getItem('authToken');
            const response = await fetch('/api/dashboard/reports/summarize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ ...reportData, reportMonth })
            });
            if (!response.ok) throw new Error('Failed to generate AI summary.');
            const { summary } = await response.json();
            setAiSummary(summary);
        } catch (err: any) {
            setSummaryError(err.message);
        } finally {
            setSummaryLoading(false);
        }
    };

    const handleExportToPdf = () => {
        if (!reportData || !aiSummary || !scriptsLoaded) {
            alert("Please generate an AI summary before exporting to PDF.");
            return;
        }

        const reportMonth = new Date(selectedMonth+'-02').toLocaleString('default', { month: 'long', year: 'numeric' });
        const { jsPDF } = (window as any).jspdf;
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();

        doc.setFont("helvetica", "bold");
        doc.setFontSize(20);
        doc.text("Monthly Financial Report", pageWidth / 2, 20, { align: 'center' });
        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        doc.text(reportMonth, pageWidth / 2, 28, { align: 'center' });

        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text("Summary:", 14, 45);
        doc.setFont("helvetica", "normal");
        const summaryLines = doc.splitTextToSize(aiSummary, pageWidth - 28);
        doc.text(summaryLines, 14, 52);
        let lastY = doc.getTextDimensions(summaryLines).h + 55;

        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text(`Monthly Sales: ${formatCurrency(reportData.monthlySales)}`, 14, lastY);
        doc.text(`Total Pending Dues: ${formatCurrency(reportData.totalPending)}`, pageWidth / 2, lastY);
        lastY += 10;
        
        (doc as any).autoTable({
            startY: lastY,
            head: [['Tenant', 'Amount Paid', 'Date']],
            body: reportData.payments.map(p => [p.tenant_name, formatCurrency(p.amount_paid), new Date(p.payment_date).toLocaleDateString()]),
            headStyles: { fillColor: [22, 160, 133] },
        });

        (doc as any).autoTable({
            head: [['Tenant', 'Amount Due', 'Status']],
            body: reportData.pendingBills.map(b => [b.tenant_name, formatCurrency(b.amount_due), b.status]),
            headStyles: { fillColor: [192, 57, 43] },
        });
        
        doc.save(`Financial_Report_${reportMonth.replace(' ', '_')}.pdf`);
    };
    
    const formatCurrency = (amount: number) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount);

    return (
        <div className="p-4 md:p-8 bg-gray-50 min-h-screen space-y-8">
            <header>
                <h1 className="text-4xl font-bold text-gray-800">Financial Reports</h1>
                <p className="text-lg text-gray-600">Analyze financial performance and generate summaries.</p>
            </header>

            <div className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                    <h2 className="text-2xl font-semibold text-gray-700">Monthly Report</h2>
                    <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-gray-500" />
                        <input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="p-2 border border-gray-300 rounded-lg text-gray-900"/>
                    </div>
                </div>

                {reportLoading ? <div className="text-center py-8"><Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" /></div> : 
                 reportError ? <div className="text-center py-8 text-red-600">{reportError}</div> :
                 reportData && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            {/* Stat Cards */}
                            <div className="bg-blue-50 p-4 rounded-lg flex items-center gap-4"><div className="bg-blue-200 p-3 rounded-full"><DollarSign className="h-6 w-6 text-blue-600"/></div><div><p className="text-sm text-blue-800">Sales for {new Date(selectedMonth+'-02').toLocaleString('default', { month: 'long' })}</p><p className="text-2xl font-bold text-blue-900">{formatCurrency(reportData.monthlySales)}</p></div></div>
                            <div className="bg-orange-50 p-4 rounded-lg flex items-center gap-4"><div className="bg-orange-200 p-3 rounded-full"><Hourglass className="h-6 w-6 text-orange-600"/></div><div><p className="text-sm text-orange-800">Total Pending Dues</p><p className="text-2xl font-bold text-orange-900">{formatCurrency(reportData.totalPending)}</p></div></div>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Data Tables */}
                            <div><h3 className="text-xl font-semibold text-gray-700 mb-4">Payments This Month</h3><div className="overflow-auto max-h-96 rounded-lg border"><table className="min-w-full text-sm"><thead className="bg-gray-100 sticky top-0"><tr className="text-left"><th className="p-3">Tenant</th><th className="p-3">Amount</th><th className="p-3">Date</th></tr></thead><tbody>{reportData.payments.map(p => (<tr key={p.id} className="border-t"><td className="p-3">{p.tenant_name}</td><td className="p-3 text-green-600 font-medium">{formatCurrency(p.amount_paid)}</td><td className="p-3">{new Date(p.payment_date).toLocaleDateString()}</td></tr>))}</tbody></table>{reportData.payments.length === 0 && <p className="p-4 text-center text-gray-500">No payments recorded for this month.</p>}</div></div>
                            <div><h3 className="text-xl font-semibold text-gray-700 mb-4">All Pending Bills</h3><div className="overflow-auto max-h-96 rounded-lg border"><table className="min-w-full text-sm"><thead className="bg-gray-100 sticky top-0"><tr className="text-left"><th className="p-3">Tenant</th><th className="p-3">Amount Due</th><th className="p-3">Status</th></tr></thead><tbody>{reportData.pendingBills.map(b => (<tr key={b.id} className="border-t"><td className="p-3">{b.tenant_name}</td><td className="p-3 text-red-600 font-medium">{formatCurrency(b.amount_due)}</td><td className="p-3">{b.status}</td></tr>))}</tbody></table>{reportData.pendingBills.length ===  0 && <p className="p-4 text-center text-gray-500">No pending bills.</p>}</div></div>
                        </div>
                    </>
                )}
            </div>

            {/* --- AI Summary & Export Section --- */}
            <div className="bg-white p-6 rounded-xl shadow-md">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">Summary & Export</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                    <div className="md:col-span-2">
                        <h3 className="font-semibold text-gray-600 mb-2">AI Generated Summary</h3>
                        {summaryLoading ? <div className="w-full bg-gray-100 rounded-lg p-4 h-32 flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div> :
                         summaryError ? <div className="w-full bg-red-50 text-red-700 rounded-lg p-4 h-32">{summaryError}</div> :
                         <textarea readOnly value={aiSummary || "Click 'Generate AI Summary' to create a statement based on the report data."} className="w-full h-32 bg-gray-50 border rounded-lg p-4 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"/>
                        }
                    </div>
                    <div className="space-y-3">
                         <button onClick={handleGenerateSummary} disabled={reportLoading || summaryLoading} className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center disabled:bg-blue-300">
                            <Wand2 className="mr-2 h-5 w-5" />
                            Generate AI Summary
                        </button>
                        <button onClick={handleExportToPdf} disabled={!aiSummary || !scriptsLoaded} className="w-full bg-green-600 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center disabled:bg-green-300">
                            <Download className="mr-2 h-5 w-5" />
                            Export to PDF
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
