'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { LayoutDashboard, Compass, UserCircle } from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/discover', label: 'Discover', icon: Compass },
  { href: '/profile', label: 'Profile', icon: UserCircle },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-6 left-0 right-0 z-50 px-6 pointer-events-none pb-safe">
      <div className="max-w-md mx-auto pointer-events-auto">
        <div className="glass-strong rounded-full px-6 py-3 flex items-center justify-between shadow-2xl border border-white/50">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href} className="relative flex flex-col items-center justify-center w-16 h-12">
                {isActive && (
                  <motion.div
                    layoutId="bottom-nav-indicator"
                    className="absolute inset-0 bg-red-light rounded-2xl -z-10"
                    transition={{ type: 'spring', bounce: 0.25, duration: 0.5 }}
                  />
                )}
                <item.icon size={22} className={`mb-1 transition-colors ${isActive ? 'text-red' : 'text-secondary hover:text-primary'}`} strokeWidth={isActive ? 2.5 : 2} />
                <span className={`text-[10px] font-bold tracking-wide transition-colors ${isActive ? 'text-red' : 'text-secondary'}`}>
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
