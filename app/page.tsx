'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Globe, ChevronRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col font-sans overflow-hidden relative">
      
      {/* Background Decor */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden flex flex-col justify-between">
        <div className="absolute right-0 top-[10%] w-[800px] h-[600px] opacity-[0.04] bg-[radial-gradient(circle,#ef4444_2px,transparent_2px)] bg-[length:16px_16px]" style={{ maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 70%)' }}></div>
        <div className="absolute bottom-0 w-full h-48 opacity-[0.03] bg-[#ef4444]" style={{ maskImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 1000 200\' preserveAspectRatio=\'none\'%3E%3Cpath d=\'M0,200 L0,140 L10,140 L10,100 L25,100 L25,150 L40,150 L40,80 L60,80 L60,170 L75,170 L75,110 L90,110 L90,60 L120,60 L120,130 L140,130 L140,90 L160,90 L160,160 L180,160 L180,110 L200,110 L200,40 L230,40 L230,120 L260,120 L260,70 L280,70 L280,150 L310,150 L310,50 L340,50 L340,140 L370,140 L370,80 L400,80 L400,120 L420,120 L420,60 L450,60 L450,150 L480,150 L480,90 L510,90 L510,130 L540,130 L540,40 L570,40 L570,160 L600,160 L600,100 L630,100 L630,140 L650,140 L650,70 L680,70 L680,120 L710,120 L710,50 L750,50 L750,150 L780,150 L780,90 L810,90 L810,170 L840,170 L840,110 L870,110 L870,60 L900,60 L900,140 L930,140 L930,80 L960,80 L960,160 L980,160 L980,100 L1000,100 L1000,200 Z\' fill=\'black\'/%3E%3C/svg%3E")' }}></div>
      </div>

      {/* Header */}
      <header className="w-full absolute top-0 left-0 right-0 z-50 pt-8">
        <div className="max-w-[1300px] mx-auto w-full px-6 lg:px-12 xl:px-16 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-3">
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="6" r="3.5" fill="#ef4444" />
              <circle cx="26" cy="11.5" r="3.5" fill="#ef4444" />
              <circle cx="26" cy="22.5" r="3.5" fill="#ef4444" />
              <circle cx="16" cy="28" r="3.5" fill="#ef4444" />
              <circle cx="6" cy="22.5" r="3.5" fill="#ef4444" />
              <circle cx="6" cy="11.5" r="3.5" fill="#ef4444" />
              <circle cx="16" cy="17" r="4.5" fill="#ef4444" />
            </svg>
            <span className="text-[26px] font-bold tracking-tight text-[#111827]">BNI CONNECT</span>
          </div>

          {/* Center Nav */}
          <nav className="hidden lg:flex items-center gap-10 font-semibold text-[15px] text-[#4b5563]">
            <Link href="#" className="hover:text-[#111827] transition-colors">Features</Link>
            <Link href="#" className="hover:text-[#111827] transition-colors">How it Works</Link>
            <Link href="#" className="hover:text-[#111827] transition-colors">For Businesses</Link>
            <Link href="#" className="hover:text-[#111827] transition-colors">Pricing</Link>
            <Link href="#" className="hover:text-[#111827] transition-colors">Blog</Link>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            <Link href="/login" className="inline-flex items-center justify-center px-6 py-2 bg-white text-gray-900 border border-gray-200 rounded-lg font-semibold text-[15px] hover:bg-gray-50 hover:border-gray-300 transition-all duration-150 ease-in-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e62e3d] focus-visible:ring-offset-2">
              Log In
            </Link>
            <Link href="/signup" className="inline-flex items-center justify-center px-6 py-2 bg-[#e62e3d] text-white border border-[#e62e3d] rounded-lg font-semibold text-[15px] hover:bg-[#d02432] hover:border-[#d02432] transition-all duration-150 ease-in-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e62e3d] focus-visible:ring-offset-2">
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-[1300px] mx-auto w-full px-6 lg:px-12 xl:px-16 pt-28 pb-8 relative z-10 flex flex-col lg:flex-row items-center justify-between">
        
        {/* Left Content */}
        <div className="w-full lg:w-[45%]">
          
          {/* Badge */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#fce9ea] text-[#e62e3d] text-[13px] font-semibold mb-8"
          >
            <Globe size={14} strokeWidth={2.5} />
            Global Network. Local Connections.
          </motion.div>

          {/* Headline */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-[64px] lg:text-[72px] leading-[1.05] font-bold tracking-[-0.03em] mb-4 text-[#111827]"
          >
            Connect.<br />
            <span className="text-[#e62e3d]">Network.</span><br />
            Grow.
          </motion.h1>

          {/* Subheadline */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="text-[18px] text-[#6b7280] mb-8 max-w-[420px] leading-[1.6]"
          >
            Discover and connect with business professionals near you, wherever your travels take you.
          </motion.p>
          
          {/* CTAs */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="flex items-center gap-4 mb-10"
          >
            <Link href="/signup" className="inline-flex items-center justify-center px-7 py-3 bg-[#e62e3d] text-white border border-[#e62e3d] rounded-lg font-semibold text-[15px] hover:bg-[#d02432] hover:border-[#d02432] transition-all duration-150 ease-in-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e62e3d] focus-visible:ring-offset-2 gap-2 shadow-sm">
              Get Started 
              <ChevronRight size={18} strokeWidth={2.5} />
            </Link>
            <button className="inline-flex items-center justify-center px-7 py-3 bg-white text-gray-900 border border-gray-200 rounded-lg font-semibold text-[15px] hover:bg-gray-50 hover:border-gray-300 transition-all duration-150 ease-in-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e62e3d] focus-visible:ring-offset-2 gap-2 shadow-sm">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>
              How It Works
            </button>
          </motion.div>

          {/* Social Proof */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="flex items-center gap-4 mb-12"
          >
            <div className="flex -space-x-3">
              <img src="https://i.pravatar.cc/150?u=12" alt="User" className="w-10 h-10 rounded-full border-[3px] border-white shadow-sm object-cover" />
              <img src="https://i.pravatar.cc/150?u=24" alt="User" className="w-10 h-10 rounded-full border-[3px] border-white shadow-sm object-cover" />
              <img src="https://i.pravatar.cc/150?u=35" alt="User" className="w-10 h-10 rounded-full border-[3px] border-white shadow-sm object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-[2px] mb-0.5">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="#fbbf24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                ))}
              </div>
              <p className="text-[12px] font-medium text-[#6b7280]">4.9/5 from 2,500+ professionals</p>
            </div>
          </motion.div>

          {/* Trusted By */}
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          >
            <p className="text-[10px] font-bold text-[#9ca3af] tracking-widest uppercase mb-4">TRUSTED BY PROFESSIONALS AT</p>
            <div className="flex flex-wrap items-center gap-7 opacity-40 grayscale font-bold text-[20px] text-[#111827] tracking-tight">
              <span className="font-sans text-[20px]">Google</span>
              <span className="flex items-center gap-1.5"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M11.4 0H0v11.4h11.4V0zM24 0H12.6v11.4H24V0zM11.4 12.6H0V24h11.4V12.6zM24 12.6H12.6V24H24V12.6z"/></svg> Microsoft</span>
              <span className="lowercase font-black text-[20px] tracking-tighter">airbnb</span>
              <span className="font-black text-[20px] tracking-tighter">stripe</span>
              <span className="flex items-center gap-1"><div className="w-4 h-4 bg-black text-white text-[10px] flex items-center justify-center rounded-[3px] font-sans">N</div> Notion</span>
            </div>
          </motion.div>

        </div>

        {/* Right Content - Map Visual */}
        <div className="w-full lg:w-[55%] h-[500px] relative mt-16 lg:mt-0 flex items-center justify-center">
          
          <div className="relative w-[700px] h-[700px] flex items-center justify-center ml-10 scale-[0.75] origin-center">
            
            {/* Dotted World Map Background */}
            <img 
              src="https://raw.githubusercontent.com/KristjanJansen/dottedmap/master/dottedmap.svg"
              alt="World Map"
              className="absolute w-[680px] h-[400px] opacity-[0.06] pointer-events-none z-0 object-contain"
              style={{ filter: 'invert(36%) sepia(84%) saturate(2059%) hue-rotate(336deg) brightness(96%) contrast(94%)' }}
            />
            
            {/* Center Pin & Concentric Ripples */}
            <motion.div 
              initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }}
              className="absolute z-20 flex items-center justify-center"
            >
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-32 h-32 rounded-full bg-[#ef4444] opacity-10 absolute" />
                <div className="w-56 h-56 rounded-full bg-[#ef4444] opacity-5 absolute" />
                {/* Thin rings */}
                <div className="w-[450px] h-[450px] rounded-full border border-gray-200 absolute" />
                <div className="w-[700px] h-[700px] rounded-full border border-gray-100 absolute" />
              </div>
              
              {/* The Red Map Pin */}
              <svg width="48" height="64" viewBox="0 0 40 56" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative z-10 drop-shadow-xl -mt-6">
                <path d="M20 0C8.954 0 0 8.954 0 20C0 35 20 56 20 56C20 56 40 35 40 20C40 8.954 31.046 0 20 0Z" fill="#ef4444"/>
                <circle cx="20" cy="20" r="8" fill="#ffffff"/>
              </svg>
            </motion.div>

            {/* Connecting Dashed Lines SVG */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" viewBox="0 0 700 700">
              {/* Curve to Avatar 1 (Top Center) */}
              <path d="M 350 350 Q 320 220 350 126" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.6" />
              {/* Curve to Avatar 2 (Top Right) */}
              <path d="M 350 350 Q 480 230 600 175" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.6" />
              {/* Curve to Avatar 3 (Middle Right) */}
              <path d="M 350 350 Q 550 350 665 364" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.6" />
              {/* Curve to Avatar 4 (Bottom Right) */}
              <path d="M 350 350 Q 470 480 550 574" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.6" />
              {/* Curve to Avatar 5 (Bottom Left) */}
              <path d="M 350 350 Q 230 480 154 574" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.6" />
              {/* Curve to Avatar 6 (Middle Left) */}
              <path d="M 350 350 Q 180 290 56 266" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.6" />
            </svg>

            {/* Floating Avatars */}
            {/* Avatar 1 (Top Center) */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}
              className="absolute top-[18%] left-[50%] z-10 -translate-x-1/2 -translate-y-1/2"
            >
              <div className="relative">
                <div className="w-[72px] h-[72px] rounded-full border-[5px] border-white shadow-xl bg-white overflow-hidden">
                  <img src="https://i.pravatar.cc/150?u=7" alt="User" className="w-full h-full object-cover" />
                </div>
                <div className="absolute bottom-1 right-0.5 w-4 h-4 bg-[#ef4444] border-2 border-white rounded-full" />
              </div>
            </motion.div>

            {/* Avatar 2 (Top Right) */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}
              className="absolute top-[25%] right-[15%] z-10 translate-x-1/2 -translate-y-1/2"
            >
              <div className="relative">
                <div className="w-[64px] h-[64px] rounded-full border-[4.5px] border-white shadow-xl bg-white overflow-hidden">
                  <img src="https://i.pravatar.cc/150?u=9" alt="User" className="w-full h-full object-cover" />
                </div>
                <div className="absolute bottom-1 right-0 w-3.5 h-3.5 bg-[#ef4444] border-2 border-white rounded-full" />
              </div>
            </motion.div>

            {/* Avatar 3 (Middle Right) */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }}
              className="absolute top-[52%] right-[5%] z-10 translate-x-1/2 -translate-y-1/2"
            >
              <div className="relative">
                <div className="w-[68px] h-[68px] rounded-full border-[4.5px] border-white shadow-xl bg-white overflow-hidden">
                  <img src="https://i.pravatar.cc/150?u=14" alt="User" className="w-full h-full object-cover" />
                </div>
                <div className="absolute bottom-1 right-0.5 w-3.5 h-3.5 bg-[#ef4444] border-2 border-white rounded-full" />
              </div>
            </motion.div>

            {/* Avatar 4 (Bottom Right) */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6 }}
              className="absolute bottom-[18%] right-[22%] z-10 translate-x-1/2 translate-y-1/2"
            >
              <div className="relative">
                <div className="w-[80px] h-[80px] rounded-full border-[5px] border-white shadow-xl bg-white overflow-hidden">
                  <img src="https://i.pravatar.cc/150?u=18" alt="User" className="w-full h-full object-cover" />
                </div>
                <div className="absolute bottom-1 right-1 w-4 h-4 bg-[#ef4444] border-2 border-white rounded-full" />
              </div>
            </motion.div>
            
            {/* Avatar 5 (Bottom Left) */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.7 }}
              className="absolute bottom-[18%] left-[22%] z-10 -translate-x-1/2 translate-y-1/2"
            >
              <div className="relative">
                <div className="w-[72px] h-[72px] rounded-full border-[5px] border-white shadow-xl bg-white overflow-hidden">
                  <img src="https://i.pravatar.cc/150?u=11" alt="User" className="w-full h-full object-cover" />
                </div>
                <div className="absolute bottom-1 right-0.5 w-4 h-4 bg-[#ef4444] border-2 border-white rounded-full" />
              </div>
            </motion.div>

            {/* Avatar 6 (Middle Left) */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.8 }}
              className="absolute top-[38%] left-[8%] z-10 -translate-x-1/2 -translate-y-1/2"
            >
              <div className="relative">
                <div className="w-[72px] h-[72px] rounded-full border-[5px] border-white shadow-xl bg-white overflow-hidden">
                  <img src="https://i.pravatar.cc/150?u=33" alt="User" className="w-full h-full object-cover" />
                </div>
                <div className="absolute bottom-1 right-0.5 w-4 h-4 bg-[#ef4444] border-2 border-white rounded-full" />
              </div>
            </motion.div>

          </div>
        </div>
      </main>
    </div>
  );
}
