'use client';

import React from 'react';
import { UserCircle } from 'lucide-react';
import { useAuth } from '@/app/credentials/AuthCredentials'; 

export default function Header() {

  const { user, loading } = useAuth();

  const renderUserDisplay = () => {

    if (loading) {
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
    <header className="flex h-16 items-center border-b bg-white px-4 md:px-6">
      <div className="ml-auto flex items-center gap-4">
        {renderUserDisplay()}
      </div>
    </header>
  );
}