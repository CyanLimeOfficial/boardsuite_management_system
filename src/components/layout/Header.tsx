'use client';

import React, { useState, useEffect } from 'react';
import { UserCircle, Building2 } from 'lucide-react';
import { useAuth } from '@/app/credentials/AuthCredentials'; 

export default function Header() {
    const { user, loading: authLoading } = useAuth();
    const [boardingHouseName, setBoardingHouseName] = useState('My Boarding House');
    const [settingsLoading, setSettingsLoading] = useState(true);

    // Fetch settings on component mount to get the boarding house name
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                // Settings are public or fetched with user's token if needed
                const token = localStorage.getItem('authToken');
                const response = await fetch('/api/dashboard/settings', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.boarding_house_name) {
                        setBoardingHouseName(data.boarding_house_name);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch settings:", error);
                // Fallback to the default name if the API call fails
            } finally {
                setSettingsLoading(false);
            }
        };

        fetchSettings();
    }, []);

    const renderUserDisplay = () => {
        if (authLoading) {
            return <p className="text-sm text-gray-500">Loading...</p>;
        }

        if (user) {
            return (
                <>
                    <p className="text-sm text-gray-600">{user.full_name}</p>
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
                    {settingsLoading ? 'Loading...' : boardingHouseName}
                </h1>
            </div>

            {/* User display on the right */}
            <div className="ml-auto flex items-center gap-4">
                {renderUserDisplay()}
            </div>
        </header>
    );
}
