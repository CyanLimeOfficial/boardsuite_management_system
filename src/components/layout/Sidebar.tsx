'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, BedDouble, Receipt, LineChart, Building2 } from 'lucide-react';


const NavLink = ({ href, icon, children }: { href: string; icon: React.ReactNode; children: React.ReactNode }) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-gray-700 ${
        isActive ? 'bg-gray-700 text-white' : 'text-gray-400'
      }`}
    >
      {icon}
      {children}
    </Link>
  );
};

export default function Sidebar() {
  return (
    <aside className="hidden w-64 flex-col border-r bg-gray-800 p-4 text-white lg:flex">
      <div className="mb-6 flex items-center gap-2 px-2 py-1">
        <Building2 className="h-8 w-8 text-white" />
        <span className="text-xl font-semibold">BoardSuite</span>
      </div>
      <nav className="flex flex-1 flex-col gap-1">
        <NavLink href="/dashboard" icon={<Home className="h-4 w-4" />}>
          Dashboard
        </NavLink>
        <NavLink href="/dashboard/tenants" icon={<Users className="h-4 w-4" />}>
          Tenants
        </NavLink>
        <NavLink href="/dashboard/rooms" icon={<BedDouble className="h-4 w-4" />}>
          Rooms
        </NavLink>
        <NavLink href="/dashboard/payments" icon={<Receipt className="h-4 w-4" />}>
          Payments & Billing
        </NavLink>
        <NavLink href="/dashboard/reports" icon={<LineChart className="h-4 w-4" />}>
          Reports
        </NavLink>
      </nav>
    </aside>
  );
}