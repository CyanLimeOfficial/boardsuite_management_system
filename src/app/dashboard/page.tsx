// In file: app/dashboard/page.tsx
'use client';

import React, { useState, useEffect, ReactNode } from 'react';
import { Users, BedDouble, Wallet, TrendingUp } from 'lucide-react';

// --- StatCard Component Definition ---
// The StatCard component is now defined directly in this file to resolve the import error.
interface StatCardProps {
    title: string;
    value: string;
    icon: ReactNode;
    description: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, description }) => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col justify-between">
            <div>
                <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    {icon}
                </div>
                <p className="text-2xl font-bold text-gray-800 mt-2">{value}</p>
            </div>
            <p className="text-xs text-gray-400 mt-4">{description}</p>
        </div>
    );
};


// --- Type definition for our stats object ---
interface DashboardStats {
    totalTenants: number;
    occupiedRooms: number;
    totalRooms: number;
    pendingCount: number;
    pendingAmount: number;
    monthlyRevenue: number;
}

export default function DashboardPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem('authToken');
                const response = await fetch('/api/dashboard/home', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch dashboard data. Please try again later.');
                }
                const data: DashboardStats = await response.json();
                setStats(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    // Helper to format currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
        }).format(amount);
    };

    // --- Loading State UI ---
    if (loading) {
        return (
            <div>
                <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
                <p className="text-gray-500 mt-1 mb-6">Fetching the latest data...</p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
                    {/* Skeleton loaders for a better UX */}
                    <div className="bg-white p-6 rounded-lg shadow-sm animate-pulse"><div className="h-6 bg-gray-200 rounded w-3/4"></div><div className="h-10 bg-gray-300 rounded w-1/2 mt-4"></div></div>
                    <div className="bg-white p-6 rounded-lg shadow-sm animate-pulse"><div className="h-6 bg-gray-200 rounded w-3/4"></div><div className="h-10 bg-gray-300 rounded w-1/2 mt-4"></div></div>
                    <div className="bg-white p-6 rounded-lg shadow-sm animate-pulse"><div className="h-6 bg-gray-200 rounded w-3/4"></div><div className="h-10 bg-gray-300 rounded w-1/2 mt-4"></div></div>
                    <div className="bg-white p-6 rounded-lg shadow-sm animate-pulse"><div className="h-6 bg-gray-200 rounded w-3/4"></div><div className="h-10 bg-gray-300 rounded w-1/2 mt-4"></div></div>
                </div>
            </div>
        );
    }

    // --- Error State UI ---
    if (error) {
        return (
            <div className="text-center py-10">
                <h1 className="text-2xl font-bold text-red-600">An Error Occurred</h1>
                <p className="text-gray-600 mt-2">{error}</p>
            </div>
        );
    }
    
    // --- Main Content ---
    const currentMonthName = new Date().toLocaleString('default', { month: 'long' });

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
            <p className="text-gray-500 mt-1 mb-6">An overview of your boarding house status.</p>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
                <StatCard
                    title="Total Tenants"
                    value={stats?.totalTenants.toString() || '0'}
                    icon={<Users className="h-6 w-6 text-blue-500" />}
                    description="All tenants with rooms"
                />
                <StatCard
                    title="Rooms Occupied"
                    value={`${stats?.occupiedRooms || '0'} / ${stats?.totalRooms || '0'}`}
                    icon={<BedDouble className="h-6 w-6 text-green-500" />}
                    description={`${(stats?.totalRooms || 0) - (stats?.occupiedRooms || 0)} rooms are vacant`}
                />
                <StatCard
                    title="Pending Payments"
                    value={formatCurrency(stats?.pendingAmount || 0)}
                    icon={<Wallet className="h-6 w-6 text-orange-500" />}
                    description={`From ${stats?.pendingCount || 0} unpaid bills`}
                />
                <StatCard
                    title="Monthly Revenue"
                    value={formatCurrency(stats?.monthlyRevenue || 0)}
                    icon={<TrendingUp className="h-6 w-6 text-purple-500" />}
                    description={`Revenue for ${currentMonthName}`}
                />
            </div>
            
            <div className="mt-8">
                <h2 className="text-2xl font-bold text-gray-800">More Reports Coming Soon</h2>
                <div className="mt-4 p-8 bg-white rounded-lg shadow-sm border border-gray-200 text-center text-gray-400">
                    Charts and recent activity will be displayed here.
                </div>
            </div>
        </div>
    );
}
