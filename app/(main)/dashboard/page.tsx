'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { MapPin, Compass, Loader2, ArrowRight, Sparkles, Users, Eye, Zap } from 'lucide-react';
import { useAuthStore } from '@/stores/use-auth-store';
import { useLocationStore } from '@/stores/use-location-store';
import { Avatar } from '@/components/ui/avatar';
import { StatusBadge } from '@/components/ui/status-badge';
import type { AvailabilityStatus } from '@/lib/types';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading } = useAuthStore();
  const { coords, city, isLocating, updateLocation } = useLocationStore();

  useEffect(() => {
    if (!isLoading && !user) router.push('/login');
    if (user && !coords && !isLocating) updateLocation();
  }, [user, isLoading, coords, isLocating, updateLocation, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={36} className="animate-spin text-[#e62e3d]" />
          <span className="text-sm font-medium text-gray-500">Loading BNI Connect...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-28 font-sans relative overflow-hidden">
      
      {/* Background Decor matching Landing Page */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden flex flex-col justify-between">
        <div className="absolute right-0 top-0 w-[600px] h-[500px] opacity-[0.03] bg-[radial-gradient(circle,#ef4444_2px,transparent_2px)] bg-[length:16px_16px]" style={{ maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 70%)' }}></div>
      </div>

      {/* Header */}
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-5 sticky top-0 z-30 lg:hidden">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="6" r="3.5" fill="#ef4444" />
              <circle cx="26" cy="11.5" r="3.5" fill="#ef4444" />
              <circle cx="26" cy="22.5" r="3.5" fill="#ef4444" />
              <circle cx="16" cy="28" r="3.5" fill="#ef4444" />
              <circle cx="6" cy="22.5" r="3.5" fill="#ef4444" />
              <circle cx="6" cy="11.5" r="3.5" fill="#ef4444" />
              <circle cx="16" cy="17" r="4.5" fill="#ef4444" />
            </svg>
            <span className="text-[18px] font-bold tracking-tight text-gray-900">BNI CONNECT</span>
          </div>
          <Link href="/profile" className="hover:scale-105 transition-transform">
            <Avatar name={user.name} avatar={user.avatar} size="md" showStatus status={user.availability} />
          </Link>
        </div>
      </header>

      <main className="px-6 py-8 relative z-10">
        <div className="max-w-[1200px] mx-auto">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Greeting & Primary Action */}
            <div className="lg:col-span-7 space-y-6">
              {/* Welcome Message */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-2"
              >
                <span className="text-xs font-semibold text-[#e62e3d] uppercase tracking-wider bg-[#fce9ea] px-2.5 py-1 rounded-full">Dashboard</span>
                <h1 className="text-[32px] lg:text-[40px] font-bold text-gray-900 tracking-tight mt-3">
                  Hello, {user.name.split(' ')[0]} 👋
                </h1>
                <p className="text-gray-500 text-sm mt-1">Here is your local networking status updates today.</p>
              </motion.div>

              {/* Discover Network Banner */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.1 }}
              >
                <Link href="/discover" className="block group">
                  <div className="bg-gradient-to-br from-[#e62e3d] via-[#eb3a48] to-[#f43f5e] p-8 lg:p-12 text-white rounded-2xl shadow-md shadow-red-500/10 hover:shadow-lg hover:shadow-red-500/20 transition-all duration-300 relative overflow-hidden active:scale-[0.99] min-h-[220px] flex flex-col justify-between">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-12 -mt-12"></div>
                    
                    <div className="w-14 h-14 bg-white/15 rounded-2xl flex items-center justify-center backdrop-blur-md shadow-inner mb-8">
                      <Compass size={28} className="text-white" />
                    </div>

                    <div className="relative z-10 flex items-end justify-between gap-4">
                      <div>
                        <h2 className="text-2xl lg:text-3xl font-bold tracking-tight">Discover Network</h2>
                        <p className="text-white/80 font-medium text-sm mt-1.5">Connect with nearby business professionals</p>
                      </div>
                      <div className="w-12 h-12 rounded-full bg-white/15 flex items-center justify-center group-hover:bg-white/25 transition-colors shrink-0">
                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            </div>

            {/* Right Column: Status & Metrics */}
            <div className="lg:col-span-5 space-y-6 lg:pt-16">
              {/* Current Status Card */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm overflow-hidden relative"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#ef4444]/5 rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                      <Sparkles size={13} className="text-[#e62e3d]" />
                      Your Status
                    </span>
                    <button 
                      onClick={() => router.push('/settings')} 
                      className="text-xs font-bold text-[#e62e3d] bg-[#fce9ea]/50 px-3 py-1.5 rounded-lg hover:bg-[#fce9ea] transition-all"
                    >
                      Edit Status
                    </button>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
                    <div className="flex items-center gap-3">
                      <StatusBadge status={user.availability as AvailabilityStatus} size="md" />
                    </div>
                    <div className="hidden sm:block h-6 w-px bg-gray-150"></div>
                    <div className="flex items-center gap-2 text-[14px] font-medium text-gray-600 bg-gray-50 px-3.5 py-2 rounded-xl w-fit">
                      <MapPin size={16} className="text-[#e62e3d]" />
                      <span>{isLocating ? 'Locating...' : city || 'Unknown location'}</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Networking Metrics Grid */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-2 gap-4"
              >
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                  <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500 mb-4">
                    <Users size={18} className="text-gray-600" />
                  </div>
                  <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Nearby Users</p>
                  <h3 className="text-2xl font-bold text-gray-900 mt-1">24</h3>
                </div>
                
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                  <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500 mb-4">
                    <Eye size={18} className="text-gray-600" />
                  </div>
                  <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Views This Week</p>
                  <h3 className="text-2xl font-bold text-gray-900 mt-1">118</h3>
                </div>
              </motion.div>

              {/* Networking Tip */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gray-50 rounded-2xl border border-gray-200/40 p-5 flex gap-3.5 items-start"
              >
                <div className="w-8 h-8 rounded-lg bg-[#fce9ea] text-[#e62e3d] flex items-center justify-center shrink-0 mt-0.5">
                  <Zap size={15} strokeWidth={2.5} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">Networking Tip</h4>
                  <p className="text-gray-500 text-xs mt-1 leading-relaxed">Keep your availability status updated when you are open for meeting local professionals for lunch or coffee.</p>
                </div>
              </motion.div>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}

