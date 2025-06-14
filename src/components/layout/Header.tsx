import React from 'react';
import { UserCircle } from 'lucide-react';

export default function Header() {
  return (
    <header className="flex h-16 items-center border-b bg-white px-4 md:px-6">
      <div className="ml-auto flex items-center gap-4">
        <p className="text-sm text-gray-600">Dexter Torres Lanzarrote</p>
        <UserCircle className="h-8 w-8 text-gray-400" />
      </div>
    </header>
  );
}