// In file: components/layout/Header.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { UserCircle, Building2 } from 'lucide-react';
import { useAuth } from '@/app/credentials/AuthCredentials'; 

export default function Header() {
    // useAuth is still useful for checking the overall login session
    const { user, loading: authLoading } = useAuth(); 
    
    // Local state to hold the most up-to-date names
    const [boardingHouseName, setBoardingHouseName] = useState('My Boarding House');
    const [displayName, setDisplayName] = useState('');
    const [dataLoading, setDataLoading] = useState(true);

    // This useEffect will run on every page load/reload, fetching fresh data.
    useEffect(() => {
        const fetchHeaderData = async () => {
            // No need to fetch if we know the user isn't logged in.
            const token = localStorage.getItem('authToken');
            if (!token) {
                setDataLoading(false);
                return;
            }

            try {
                // The settings API returns both business and user details.
                const response = await fetch('/api/dashboard/settings', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.boarding_house_name) {
                        setBoardingHouseName(data.boarding_house_name);
                    }
                    // Set the display name from the fresh API data
                    if (data.full_name) {
                        setDisplayName(data.full_name);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch header data:", error);
            } finally {
                setDataLoading(false);
            }
        };

        fetchHeaderData();
    }, []);

    const renderUserDisplay = () => {
        // Wait for both the initial auth check and our data fetch to complete.
        if (authLoading || dataLoading) {
            return <p className="text-sm text-gray-500">Loading...</p>;
        }

        // Check if a user session exists from the auth hook.
        if (user) {
            return (
                <>
                    {/* Use the displayName state, which is guaranteed to be fresh. */}
                    {/* Fallback to user.full_name just in case. */}
                    <p className="text-sm text-gray-800 font-medium">{displayName || user.full_name}</p>
                    <UserCircle className="h-8 w-8 text-gray-600" />
                </>
            );
        }

        return (
            <a href="/login" className="text-sm font-medium text-blue-600 hover:underline">
                Login
            </a>
        );
    };

    return (
        <header className="flex h-16 items-center justify-between border-b bg-white px-4 md:px-6">
            {/* Boarding House Name on the left */}
            <div className="flex items-center gap-3">
                <Building2 className="h-6 w-6 text-gray-700" />
                <h1 className="text-lg font-semibold text-gray-800">
                    {dataLoading ? 'Loading...' : boardingHouseName}
                </h1>
            </div>

            {/* User display on the right */}
            <div className="ml-auto flex items-center gap-4">
                {renderUserDisplay()}
            </div>
        </header>
    );
}
