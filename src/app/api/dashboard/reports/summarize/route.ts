// In file: app/api/dashboard/reports/summarize/route.ts

import { NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';

export async function POST(request: Request) {
    try {
        const token = request.headers.get('authorization')?.split(' ')[1];
        if (!token) {
            return new NextResponse(JSON.stringify({ message: 'Authentication required' }), { status: 401 });
        }
        verify(token, process.env.JWT_SECRET || 'YOUR_SECRET_KEY');

        const reportData = await request.json();
        const { monthlySales, totalPending, payments, pendingBills, reportMonth } = reportData;
        
        if (!reportData) {
             return new NextResponse(JSON.stringify({ message: 'Report data is required.' }), { status: 400 });
        }

        // --- Construct a detailed prompt for the AI ---
        const prompt = `
            You are a financial analyst for a property manager in Naval, Eastern Visayas, Philippines.
            Your task is to write a concise, professional summary statement based on the following financial data for ${reportMonth}.
            The current date is ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.

            Financial Data:
            - Total Sales This Month: PHP ${monthlySales.toFixed(2)} from ${payments.length} payments.
            - Total Outstanding Dues (All Months): PHP ${totalPending.toFixed(2)} from ${pendingBills.length} tenants.

            Based on this data, generate a one-paragraph summary. Start with a clear overview of the month's performance. Mention the total sales and then comment on the total outstanding dues. Maintain a professional and slightly formal tone. Conclude with a forward-looking or concluding remark.
        `;

        const payload = {
            contents: [{ role: "user", parts: [{ text: prompt }] }],
        };

        const apiKey = ""; // Leave blank
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

        const apiResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!apiResponse.ok) {
            const errorData = await apiResponse.json();
            throw new Error(errorData.error?.message || "An unknown AI model error occurred.");
        }

        const result = await apiResponse.json();

        if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
             return NextResponse.json({ summary: result.candidates[0].content.parts[0].text });
        } else {
            throw new Error("The AI model did not return a valid summary.");
        }

    } catch (error: any) {
        console.error('API Error in /dashboard/reports/summarize:', error);
        return new NextResponse(JSON.stringify({ message: 'Internal Server Error', error: error.message }), { status: 500 });
    }
}
