'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Chrome as Home, FileText, History, StickyNote } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Penjualan', icon: Home },
  { href: '/laporan', label: 'Laporan', icon: FileText },
  { href: '/riwayat-setoran', label: 'Riwayat', icon: History },
  { href: '/catatan', label: 'Catatan', icon: StickyNote }
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe z-50">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full transition-colors',
                isActive ? 'text-blue-600' : 'text-gray-600'
              )}
            >
              <Icon className={cn('w-6 h-6 mb-1', isActive && 'scale-110')} />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
