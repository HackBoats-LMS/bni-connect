'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Loader2, Globe } from 'lucide-react';
import { useAuthStore } from '@/stores/use-auth-store';

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Login failed'); setLoading(false); return; }
      setUser(data.user);
      router.push('/dashboard');
    } catch {
      setError('Something went wrong');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white flex font-sans overflow-hidden relative">
      
      {/* Background Decor (Mobile/Left panel) */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden flex flex-col justify-between lg:w-1/2">
        <div className="absolute right-0 top-[10%] w-[600px] h-[500px] opacity-[0.04] bg-[radial-gradient(circle,#ef4444_2px,transparent_2px)] bg-[length:16px_16px]" style={{ maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 70%)' }}></div>
      </div>

      {/* Left Pane - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-6 sm:p-12 md:p-16 z-10 relative bg-white/80 backdrop-blur-sm min-h-screen">
        
        {/* Header/Logo */}
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="6" r="3.5" fill="#ef4444" />
              <circle cx="26" cy="11.5" r="3.5" fill="#ef4444" />
              <circle cx="26" cy="22.5" r="3.5" fill="#ef4444" />
              <circle cx="16" cy="28" r="3.5" fill="#ef4444" />
              <circle cx="6" cy="22.5" r="3.5" fill="#ef4444" />
              <circle cx="6" cy="11.5" r="3.5" fill="#ef4444" />
              <circle cx="16" cy="17" r="4.5" fill="#ef4444" />
            </svg>
            <span className="text-[22px] font-bold tracking-tight text-[#111827]">BNI CONNECT</span>
          </Link>
        </div>

        {/* Center Content Form */}
        <div className="w-full max-w-[400px] mx-auto my-auto py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h1 className="text-[32px] font-bold tracking-tight text-[#111827] mb-2">Welcome back</h1>
            <p className="text-[#6b7280] text-[15px] mb-8">Sign in to discover and connect with professionals near you.</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }} 
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3.5 rounded-lg text-sm text-[#e62e3d] bg-[#fce9ea] border border-[#fce9ea]"
                >
                  {error}
                </motion.div>
              )}

              <div>
                <label htmlFor="login-email" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Email Address</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    id="login-email" 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com" 
                    className="w-full px-4 py-3 pl-11 bg-gray-50/70 border border-gray-200 rounded-lg text-sm focus:outline-none focus:bg-white focus:border-[#e62e3d] focus:ring-2 focus:ring-[#e62e3d]/15 transition-all text-gray-900" 
                    required 
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label htmlFor="login-password" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">Password</label>
                  <Link href="#" className="text-xs font-semibold text-[#e62e3d] hover:underline">Forgot password?</Link>
                </div>
                <div className="relative">
                  <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    id="login-password" 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••" 
                    className="w-full px-4 py-3 pl-11 bg-gray-50/70 border border-gray-200 rounded-lg text-sm focus:outline-none focus:bg-white focus:border-[#e62e3d] focus:ring-2 focus:ring-[#e62e3d]/15 transition-all text-gray-900" 
                    required 
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading} 
                className="inline-flex items-center justify-center gap-2 w-full px-6 py-3 bg-[#e62e3d] text-white border border-[#e62e3d] rounded-lg font-semibold text-[15px] hover:bg-[#d02432] hover:border-[#d02432] transition-all duration-150 ease-in-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e62e3d] focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <>Sign In <ArrowRight size={16} /></>}
              </button>
            </form>
          </motion.div>
        </div>

        {/* Footer */}
        <div className="text-center lg:text-left text-sm text-gray-500">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-[#e62e3d] font-bold hover:underline">Sign up</Link>
        </div>

      </div>

      {/* Right Pane - Map Visual Showcase */}
      <div className="hidden lg:flex w-1/2 bg-[#111827] relative items-center justify-center overflow-hidden">
        
        {/* Abstract Background Design */}
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none bg-[radial-gradient(circle,#ef4444_1px,transparent_1px)] bg-[length:24px_24px]"></div>
        
        <div className="relative w-[600px] h-[600px] flex items-center justify-center scale-95 origin-center z-10">
          {/* Concentric ripples */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-24 h-24 rounded-full bg-[#ef4444] opacity-20 absolute animate-pulse" />
            <div className="w-48 h-48 rounded-full bg-[#ef4444] opacity-10 absolute" />
            <div className="w-[350px] h-[350px] rounded-full border border-white/10 absolute" />
            <div className="w-[500px] h-[500px] rounded-full border border-white/5 absolute" />
          </div>

          {/* Dotted Map */}
          <img 
            src="https://raw.githubusercontent.com/KristjanJansen/dottedmap/master/dottedmap.svg"
            alt="World Map"
            className="absolute w-[500px] h-[300px] opacity-[0.08] pointer-events-none z-0 object-contain"
            style={{ filter: 'invert(100%)' }}
          />

          {/* Center Pin */}
          <div className="absolute z-20 flex items-center justify-center">
            <svg width="40" height="52" viewBox="0 0 40 56" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative z-10 drop-shadow-xl -mt-6">
              <path d="M20 0C8.954 0 0 8.954 0 20C0 35 20 56 20 56C20 56 40 35 40 20C40 8.954 31.046 0 20 0Z" fill="#ef4444"/>
              <circle cx="20" cy="20" r="8" fill="#ffffff"/>
            </svg>
          </div>

          {/* Floating Avatars */}
          <div className="absolute top-[20%] left-[50%] -translate-x-1/2 -translate-y-1/2">
            <img src="https://i.pravatar.cc/150?u=7" alt="User" className="w-[56px] h-[56px] rounded-full border-[3px] border-white shadow-xl object-cover" />
          </div>
          <div className="absolute top-[30%] right-[15%] translate-x-1/2 -translate-y-1/2">
            <img src="https://i.pravatar.cc/150?u=9" alt="User" className="w-[50px] h-[50px] rounded-full border-[3px] border-white shadow-xl object-cover" />
          </div>
          <div className="absolute top-[55%] right-[8%] translate-x-1/2 -translate-y-1/2">
            <img src="https://i.pravatar.cc/150?u=14" alt="User" className="w-[52px] h-[52px] rounded-full border-[3px] border-white shadow-xl object-cover" />
          </div>
          <div className="absolute bottom-[22%] right-[22%] translate-x-1/2 translate-y-1/2">
            <img src="https://i.pravatar.cc/150?u=18" alt="User" className="w-[60px] h-[60px] rounded-full border-[3px] border-white shadow-xl object-cover" />
          </div>
          <div className="absolute bottom-[22%] left-[22%] -translate-x-1/2 translate-y-1/2">
            <img src="https://i.pravatar.cc/150?u=11" alt="User" className="w-[56px] h-[56px] rounded-full border-[3px] border-white shadow-xl object-cover" />
          </div>
          <div className="absolute top-[42%] left-[10%] -translate-x-1/2 -translate-y-1/2">
            <img src="https://i.pravatar.cc/150?u=33" alt="User" className="w-[56px] h-[56px] rounded-full border-[3px] border-white shadow-xl object-cover" />
          </div>
        </div>

        {/* Brand Text Overlay */}
        <div className="absolute bottom-12 left-12 right-12 z-20 text-white/95">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-white text-[12px] font-semibold mb-4 backdrop-blur-md">
            <Globe size={12} strokeWidth={2.5} className="text-[#ef4444]" />
            Global Network. Local Connections.
          </div>
          <h2 className="text-[28px] font-bold tracking-tight mb-2 leading-tight">Discover professionals near you, wherever you go.</h2>
          <p className="text-gray-400 text-[14px]">Connect, network, and grow with BNI Connect.</p>
        </div>

      </div>

    </div>
  );
}

