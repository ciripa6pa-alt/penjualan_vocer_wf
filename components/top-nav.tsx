'use client';

import { Wifi } from 'lucide-react';

interface TopNavProps {
  title: string;
}

export function TopNav({ title }: TopNavProps) {
  return (
    <header className="fixed top-0 left-0 right-0 bg-gradient-to-r from-blue-500 to-blue-600 text-white z-50 shadow-md">
      <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-3">
        <Wifi className="w-6 h-6" />
        <h1 className="text-lg font-semibold">{title}</h1>
      </div>
    </header>
  );
}
