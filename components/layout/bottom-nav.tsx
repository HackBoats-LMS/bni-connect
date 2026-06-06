'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { LayoutDashboard, Compass, UserCircle, Users, AlignLeft, Map as MapIcon } from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/discover', label: 'Map', icon: MapIcon },
  { href: '/discover?view=list', label: 'List', icon: AlignLeft },
];

export function BottomNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const view = searchParams.get('view');

  return (
    <div className="fixed bottom-6 left-0 right-0 z-50 px-6 pointer-events-none pb-safe">
      <div className="max-w-md mx-auto pointer-events-auto">
        <div className="bg-white/95 backdrop-blur-xl rounded-full px-2 py-2 flex items-center justify-between shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-200/60">
          {navItems.map((item) => {
            let isActive = false;
            if (item.href === '/discover') {
              isActive = pathname === '/discover' && view !== 'list';
            } else if (item.href === '/discover?view=list') {
              isActive = pathname === '/discover' && view === 'list';
            } else {
              isActive = pathname === item.href;
            }
            return (
              <Link key={item.href} href={item.href} className="relative flex flex-col items-center justify-center w-16 h-12">
                {isActive && (
                  <motion.div
                    layoutId="bottom-nav-indicator"
                    className="absolute inset-0 bg-[#fce9ea] rounded-2xl -z-10"
                    transition={{ type: 'spring', bounce: 0.25, duration: 0.5 }}
                  />
                )}
                <item.icon size={22} className={`mb-1 transition-colors ${isActive ? 'text-[#e62e3d]' : 'text-gray-500 hover:text-gray-900'}`} strokeWidth={isActive ? 2.5 : 2} />
                <span className={`text-[10px] font-bold tracking-wide transition-colors ${isActive ? 'text-[#e62e3d]' : 'text-gray-500'}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
