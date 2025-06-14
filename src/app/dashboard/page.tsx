import React from 'react';
import StatCard from '@/components/dashboard/StatCard';
import { Users, BedDouble, Wallet, TrendingUp } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
      <p className="text-gray-500 mt-1 mb-6">An overview of your boarding house status.</p>

      {/* Grid for the main statistics cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
        <StatCard
          title="Total Tenants"
          value="48"
          icon={<Users className="h-6 w-6 text-blue-500" />}
          description="All active and inactive tenants"
        />
        <StatCard
          title="Rooms Occupied"
          value="35 / 40"
          icon={<BedDouble className="h-6 w-6 text-green-500" />}
          description="9 rooms are currently vacant"
        />
        <StatCard
          title="Pending Payments"
          value="₱12,500"
          icon={<Wallet className="h-6 w-6 text-orange-500" />}
          description="From 5 tenants for this month"
        />
        <StatCard
          title="Monthly Revenue"
          value="₱175,000"
          icon={<TrendingUp className="h-6 w-6 text-purple-500" />}
          description="June 2025 Revenue"
        />
      </div>

      {/* Placeholder for future charts and reports */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold text-gray-800">More Reports Coming Soon</h2>
        <div className="mt-4 p-8 bg-white rounded-lg shadow-sm border border-gray-200 text-center text-gray-400">
          Charts and recent activity will be displayed here.
        </div>
      </div>
    </div>
  );
}
