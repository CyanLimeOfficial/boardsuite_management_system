// In file: app/dashboard/reports/page.tsx
'use client';

import React, { useState, useEffect, FormEvent, ChangeEvent, useCallback } from 'react';
import { Upload, FileText, Loader2, AlertTriangle, Wand2, Calendar, DollarSign, Hourglass, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
    const [isExporting, setIsExporting] = useState(false);

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
    const handleExportToPdf = async () => {
        if (!reportData) return;
        setIsExporting(true);
        try {
            const reportMonth = new Date(selectedMonth+'-02').toLocaleString('default', { month: 'long', year: 'numeric' });
            
            // 1. Get AI Summary
            const token = localStorage.getItem('authToken');
            const summaryResponse = await fetch('/api/dashboard/reports/summarize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ ...reportData, reportMonth })
            });
            if (!summaryResponse.ok) throw new Error('Failed to generate AI summary.');
            const { summary } = await summaryResponse.json();

            // 2. Build PDF
            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.getWidth();

            // Header
            doc.setFont("helvetica", "bold");
            doc.setFontSize(20);
            doc.text("Monthly Financial Report", pageWidth / 2, 20, { align: 'center' });
            
            doc.setFontSize(12);
            doc.setFont("helvetica", "normal");
            doc.text(reportMonth, pageWidth / 2, 28, { align: 'center' });

            // AI Summary
            doc.setFontSize(11);
            doc.setFont("helvetica", "bold");
            doc.text("AI Generated Summary:", 14, 45);
            doc.setFont("helvetica", "normal");
            const summaryLines = doc.splitTextToSize(summary, pageWidth - 28);
            doc.text(summaryLines, 14, 52);
            let lastY = doc.getTextDimensions(summaryLines).h + 55;

            // Key Stats
            doc.setFontSize(11);
            doc.setFont("helvetica", "bold");
            doc.text(`Monthly Sales: ${formatCurrency(reportData.monthlySales)}`, 14, lastY);
            doc.text(`Total Pending Dues: ${formatCurrency(reportData.totalPending)}`, pageWidth / 2, lastY);
            lastY += 10;
            
            // Payments Table
            autoTable(doc, {
                startY: lastY,
                head: [['Tenant', 'Amount Paid', 'Date']],
                body: reportData.payments.map(p => [p.tenant_name, formatCurrency(p.amount_paid), new Date(p.payment_date).toLocaleDateString()]),
                headStyles: { fillColor: [22, 160, 133] },
                didDrawPage: (data) => { data.settings.margin.top = 10; }
            });

            // Pending Bills Table
            autoTable(doc, {
                head: [['Tenant', 'Amount Due', 'Status']],
                body: reportData.pendingBills.map(b => [b.tenant_name, formatCurrency(b.amount_due), b.status]),
                headStyles: { fillColor: [192, 57, 43] },
                didDrawPage: (data) => { data.settings.margin.top = 10; }
            });
            
            doc.save(`Financial_Report_${reportMonth.replace(' ', '_')}.pdf`);
        } catch (err: any) {
            alert(`Error exporting PDF: ${err.message}`);
        } finally {
            setIsExporting(false);
        }
    };
    
    const handleMonthChange = (e: ChangeEvent<HTMLInputElement>) => setSelectedMonth(e.target.value);
    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => { /* ... (omitted for brevity) ... */ };
    const handleExtraction = async (event: FormEvent) => { /* ... (omitted for brevity) ... */ };
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
                    <div className="flex items-center gap-4">
                         <div className="flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-gray-500" />
                            <input type="month" value={selectedMonth} onChange={handleMonthChange} className="p-2 border border-gray-300 rounded-lg text-gray-900"/>
                        </div>
                        <button onClick={handleExportToPdf} disabled={!reportData || isExporting} className="bg-green-600 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center disabled:bg-green-300">
                            {isExporting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Download className="mr-2 h-5 w-5" />}
                            {isExporting ? 'Exporting...' : 'Export PDF'}
                        </button>
                    </div>
                </div>

                {reportLoading && <div className="text-center py-4"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>}
                {reportError && <div className="text-center py-4 text-red-600">{reportError}</div>}
                {reportData && !reportLoading && ( /* ... (report display JSX omitted for brevity) ... */ )}
            </div>
            
            {/* --- AI Image Extractor Section --- */}
            <div className="bg-white p-6 rounded-xl shadow-md">
                 <h2 className="text-2xl font-semibold text-gray-700 mb-4">AI Data Extractor</h2>
                 {/* ... (AI extractor JSX omitted for brevity) ... */}
            </div>
        </div>
    );
}
