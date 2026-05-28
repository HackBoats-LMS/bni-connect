'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Briefcase, 
  Building2, 
  MapPin, 
  Mail, 
  Edit3, 
  Loader2, 
  CheckCircle2, 
  Users, 
  Clock, 
  Award, 
  Link as LinkIcon 
} from 'lucide-react';
import { useAuthStore } from '@/stores/use-auth-store';
import { useLocationStore } from '@/stores/use-location-store';
import { Avatar } from '@/components/ui/avatar';
import { MapView } from '@/components/map/map-view';
import type { AvailabilityStatus, UserProfile } from '@/lib/types';

export default function MyProfilePage() {
  const router = useRouter();
  const { user, isLoading } = useAuthStore();
  const { coords } = useLocationStore();

  const [memberCount, setMemberCount] = useState(0);
  const [recentMembers, setRecentMembers] = useState<UserProfile[]>([]);

  useEffect(() => { 
    if (!isLoading && !user) router.push('/login'); 
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user) {
      fetch('/api/members')
        .then((r) => r.json())
        .then((d) => {
          if (d.members) {
            setMemberCount(d.members.length);
            setRecentMembers(d.members.slice(0, 5));
          }
        })
        .catch(() => {});
    }
  }, [user]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 size={32} className="animate-spin text-[#e62e3d]" />
      </div>
    );
  }



  return (
    <div className="min-h-screen bg-gray-50/50 pb-20 font-sans">
      
      {/* Top Bar Navigation */}
      <div className="bg-white border-b border-gray-150 px-6 py-4 sticky top-20 lg:top-20 z-20">
        <div className="max-w-[1100px] mx-auto flex items-center justify-between">
          <h1 className="text-sm font-bold text-gray-800">My Profile</h1>
          <button 
            onClick={() => router.push('/settings')} 
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#e62e3d] hover:bg-[#d02432] text-white text-xs font-bold rounded-xl active:scale-[0.98] transition-all cursor-pointer shadow-sm"
          >
            <Edit3 size={14} />
            <span>Edit Profile</span>
          </button>
        </div>
      </div>

      <div className="px-4 py-6 lg:p-8">
        <div className="max-w-[1100px] mx-auto space-y-6">
          
          {/* PROFILE HEADER CARD */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden relative"
          >
            {/* Pink Banner */}
            <div className="h-44 w-full bg-gradient-to-r from-[#ffe4e6] to-[#fecdd3] relative overflow-hidden">
              {/* Skyline Art Overlay */}
              <div 
                className="absolute bottom-0 w-full h-24 opacity-[0.09] bg-repeat-x"
                style={{ 
                  backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 1000 200\' preserveAspectRatio=\'none\'%3E%3Cpath d=\'M0,200 L0,140 L10,140 L10,100 L25,100 L25,150 L40,150 L40,80 L60,80 L60,170 L75,170 L75,110 L90,110 L90,60 L120,60 L120,130 L140,130 L140,90 L160,90 L160,160 L180,160 L180,110 L200,110 L200,40 L230,40 L230,120 L260,120 L260,70 L280,70 L280,150 L310,150 L310,50 L340,50 L340,140 L370,140 L370,80 L400,80 L400,120 L420,120 L420,60 L450,60 L450,150 L480,150 L480,90 L510,90 L510,130 L540,130 L540,40 L570,40 L570,160 L600,160 L600,100 L630,100 L630,140 L650,140 L650,70 L680,70 L680,120 L710,120 L710,50 L750,50 L750,150 L780,150 L780,90 L810,90 L810,170 L840,170 L840,110 L870,110 L870,60 L900,60 L900,140 L930,140 L930,80 L960,80 L960,160 L980,160 L980,100 L1000,100 L1000,200 Z\' fill=\'black\'/%3E%3C/svg%3E")' 
                }}
              />
            </div>

            {/* Profile Core Details Block */}
            <div className="px-6 lg:px-8 pb-6 pt-16 lg:pt-6 relative flex flex-col lg:flex-row lg:items-end justify-between gap-6">
              
              {/* Avatar position overlaps banner */}
              <div className="absolute -top-16 left-6 lg:left-8">
                <div className="relative">
                  <Avatar name={user.name} avatar={user.avatar} size="xl" showStatus status={user.availability} />
                </div>
              </div>

              {/* Name Info Column */}
              <div className="lg:pl-24 pt-4 lg:pt-0 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-2xl lg:text-3xl font-extrabold text-gray-900 tracking-tight">{user.name}</h2>
                  <CheckCircle2 size={20} className="text-[#e62e3d] fill-[#fce9ea]" />
                </div>
                <p className="text-sm font-semibold text-gray-700">{user.profession}</p>
                
                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400 font-bold pt-1.5">
                  <span className="flex items-center gap-1.5"><Building2 size={15} />{user.company}</span>
                  <span className="flex items-center gap-1.5"><MapPin size={15} />{user.city || 'Bangalore, India'}</span>
                  <span className="text-[#e62e3d] font-bold">• You</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-3 mt-4 lg:mt-0">
                <button 
                  onClick={() => router.push('/settings')}
                  className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl text-xs font-bold active:scale-[0.98] transition-all cursor-pointer shadow-sm"
                >
                  Edit Profile settings
                </button>
              </div>

            </div>
          </motion.div>

          {/* STATS BAR */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm grid grid-cols-2 lg:grid-cols-4 gap-6"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-500 shrink-0">
                <Users size={18} />
              </div>
              <div>
                <p className="text-[14px] font-bold text-gray-900">{memberCount}</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Connections</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-500 shrink-0">
                <Clock size={18} />
              </div>
              <div>
                <p className="text-[14px] font-bold text-gray-900">5+ Years</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Experience</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-500 shrink-0">
                <MapPin size={18} />
              </div>
              <div>
                <p className="text-[14px] font-bold text-gray-900">12 Mutual</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Connections</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-500 shrink-0">
                <Award size={18} />
              </div>
              <div>
                <p className="text-[14px] font-bold text-gray-900">Top 10%</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Most Active</p>
              </div>
            </div>
          </motion.div>

          {/* GRID PANELS */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left/Middle Content Column */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* About Box */}
              <motion.div 
                initial={{ opacity: 0, y: 15 }} 
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm space-y-4"
              >
                <h3 className="text-base font-bold text-gray-900 tracking-tight">About</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {user.bio || `Senior ${user.profession} specializing in building scalable networks and driving product strategies at ${user.company}. Passionate about building robust systems and connecting with business leaders across standard industrial verticals.`}
                </p>
                
                {/* Professional tags */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {['SaaS', 'Product Strategy', 'Growth', 'Leadership', 'Startups'].map((tag) => (
                    <span key={tag} className="px-3 py-1 bg-gray-50 border border-gray-150 rounded-full text-xs font-semibold text-gray-600">
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>

              {/* Experience Box */}
              <motion.div 
                initial={{ opacity: 0, y: 15 }} 
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm space-y-6"
              >
                <h3 className="text-base font-bold text-gray-900 tracking-tight">Experience</h3>
                
                <div className="space-y-6">
                  {/* Item 1 */}
                  <div className="flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-xl bg-red-50 text-[#e62e3d] flex items-center justify-center shrink-0 font-black text-sm border border-[#e62e3d]/10">
                      T
                    </div>
                    <div>
                      <h4 className="font-bold text-[14px] text-gray-900">Founder & CEO</h4>
                      <p className="text-xs text-gray-500 font-semibold">{user.company}</p>
                      <p className="text-[11px] text-gray-400 font-medium mt-1">Jan 2021 - Present • 3 yrs 4 mos</p>
                    </div>
                  </div>

                  {/* Item 2 */}
                  <div className="flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 text-gray-400 flex items-center justify-center shrink-0 font-black text-sm border border-gray-150">
                      B
                    </div>
                    <div>
                      <h4 className="font-bold text-[14px] text-gray-900">Product Manager</h4>
                      <p className="text-xs text-gray-500 font-semibold">BrandLift Media</p>
                      <p className="text-[11px] text-gray-400 font-medium mt-1">Jun 2018 - Dec 2020 • 2 yrs 6 mos</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Skills Box */}
              <motion.div 
                initial={{ opacity: 0, y: 15 }} 
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm space-y-5"
              >
                <h3 className="text-base font-bold text-gray-900 tracking-tight">Skills</h3>
                
                <div className="space-y-4">
                  {[
                    { label: 'Product Strategy', score: 90 },
                    { label: 'Leadership', score: 85 },
                    { label: 'Go-to-Market', score: 80 },
                    { label: 'Business Development', score: 75 },
                    { label: 'User Research', score: 70 },
                  ].map((skill) => (
                    <div key={skill.label} className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-gray-700">
                        <span>{skill.label}</span>
                        <span>{skill.score}%</span>
                      </div>
                      <div className="h-2 w-full bg-gray-55 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-[#e62e3d] rounded-full transition-all duration-1000"
                          style={{ width: `${skill.score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

            </div>

            {/* Right Side Column */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Availability Panel */}
              <motion.div 
                initial={{ opacity: 0, y: 15 }} 
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Availability</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100">
                    {user.availability}
                  </span>
                </div>
                <p className="text-xs text-gray-500">Open to connect and meet near local cafes or coworking hubs.</p>
                <button 
                  onClick={() => router.push('/settings')}
                  className="w-full py-2.5 border border-[#e62e3d] text-[#e62e3d] text-xs font-bold rounded-xl bg-[#fce9ea]/30 hover:bg-[#fce9ea]/50 transition-colors cursor-pointer"
                >
                  Change Availability
                </button>
              </motion.div>

              {/* Location Map Preview Panel */}
              {coords && (
                <motion.div 
                  initial={{ opacity: 0, y: 15 }} 
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm space-y-4"
                >
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Location</h3>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-gray-700">{user.city || 'Bangalore, India'}</p>
                    {user.address && (
                      <p className="text-[10px] text-gray-400 font-semibold leading-normal">{user.address}</p>
                    )}
                  </div>
                  
                  {/* Leaflet map preview container */}
                  <div className="h-44 rounded-2xl overflow-hidden border border-gray-150">
                    <MapView 
                      userLocation={{ 
                        latitude: user.latitude ?? coords.latitude, 
                        longitude: user.longitude ?? coords.longitude 
                      }} 
                      members={[]} 
                    />
                  </div>
                </motion.div>
              )}

              {/* Mutual Connections Row Panel */}
              <motion.div 
                initial={{ opacity: 0, y: 15 }} 
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Connections ({memberCount})</h3>
                  <button onClick={() => router.push('/connections')} className="text-xs font-bold text-[#e62e3d] hover:underline cursor-pointer">View all</button>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="flex -space-x-2">
                    {recentMembers.map((m) => (
                      <div key={m.id} className="relative">
                        <Avatar name={m.name} avatar={m.avatar} size="sm" showStatus status={m.availability} />
                      </div>
                    ))}
                  </div>
                  {memberCount > 5 && (
                    <div className="w-8 h-8 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-500 shrink-0">
                      +{memberCount - 5}
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Connect On Social Links Panel */}
              <motion.div 
                initial={{ opacity: 0, y: 15 }} 
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm space-y-4"
              >
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Connect on</h3>
                <div className="flex items-center gap-3">
                  <a href="#" className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-250 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors">
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                    </svg>
                  </a>
                  <a href="#" className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-250 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors">
                    <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                    </svg>
                  </a>
                  <a href="#" className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-250 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors">
                    <LinkIcon size={18} />
                  </a>
                </div>
              </motion.div>

            </div>

          </div>

        </div>
      </div>

    </div>
  );
}
