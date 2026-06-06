'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/stores/use-auth-store';
import { Clock, ShieldAlert } from 'lucide-react';

export default function PendingPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  useEffect(() => {
    // If user is approved, send them to dashboard immediately
    if (user?.isApproved || user?.role === 'admin') {
      router.push('/dashboard');
    }
  }, [user, router]);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-6 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-3xl border border-gray-100 p-8 shadow-sm"
      >
        <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
          <Clock size={32} className="text-orange-500" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Pending Approval</h1>
        
        <p className="text-gray-500 text-sm leading-relaxed mb-8">
          Thank you for joining Nearby. To ensure the quality of our network, all new accounts must be verified by an administrator before gaining access to the directory.
        </p>

        <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 flex items-start gap-4 text-left">
          <ShieldAlert size={20} className="text-gray-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-bold text-gray-800">What happens next?</h3>
            <p className="text-xs text-gray-500 mt-1">
              Our team will review your profile shortly. You will be able to access the dashboard and discover features once approved. Please check back later!
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
