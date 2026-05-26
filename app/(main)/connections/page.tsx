'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search, MessageSquare, UserCheck, UserPlus, Filter, ShieldCheck, Mail, MapPin } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';

// Mock connections list
const mockConnections = [
  {
    id: '1',
    name: 'Rohit Sharma',
    profession: 'Entrepreneur',
    company: 'TechNova Solutions',
    city: 'Koramangala, Bangalore',
    avatar: 'https://i.pravatar.cc/150?u=7',
    availability: 'Available',
    connectedSince: 'Connected 2 days ago',
  },
  {
    id: '2',
    name: 'Priya Nair',
    profession: 'Marketing Consultant',
    company: 'BrandLift Media',
    city: 'Indiranagar, Bangalore',
    avatar: 'https://i.pravatar.cc/150?u=9',
    availability: 'Open to Meet',
    connectedSince: 'Connected 1 week ago',
  },
  {
    id: '4',
    name: 'Neha Verma',
    profession: 'UX Designer',
    company: 'Design Studio',
    city: 'HSR Layout, Bangalore',
    avatar: 'https://i.pravatar.cc/150?u=11',
    availability: 'Available',
    connectedSince: 'Connected 2 weeks ago',
  },
  {
    id: '5',
    name: 'Vikram Singh',
    profession: 'Investor',
    company: 'Skyline Ventures',
    city: 'BTM Layout, Bangalore',
    avatar: 'https://i.pravatar.cc/150?u=18',
    availability: 'Open to Meet',
    connectedSince: 'Connected 1 month ago',
  }
];

export default function ConnectionsPage() {
  const [search, setSearch] = useState('');
  
  const filtered = mockConnections.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.profession.toLowerCase().includes(search.toLowerCase()) ||
    c.company.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 lg:p-8 font-sans">
      <div className="max-w-[1000px] mx-auto space-y-6">
        
        {/* Header Summary */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-150 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#fce9ea] text-[#e62e3d] flex items-center justify-center shrink-0">
              <UserCheck size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Your Network</h1>
              <p className="text-xs text-gray-500 font-semibold mt-0.5">{mockConnections.length} active connections</p>
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-[#e62e3d] hover:bg-[#d02432] text-white text-xs font-bold rounded-xl active:scale-[0.98] transition-all cursor-pointer">
            <UserPlus size={14} />
            <span>Add Connection</span>
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, role or company..."
              className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#e62e3d] focus:ring-2 focus:ring-[#e62e3d]/15 transition-all text-gray-900 shadow-sm"
            />
          </div>
          <button className="p-3 bg-white border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors shadow-sm cursor-pointer">
            <Filter size={18} />
          </button>
        </div>

        {/* Connections List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.length > 0 ? (
            filtered.map((c, index) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all flex flex-col justify-between"
              >
                <div className="flex gap-4">
                  <Avatar name={c.name} avatar={c.avatar} size="lg" showStatus status={c.availability} />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-gray-900 truncate">{c.name}</h3>
                    <p className="text-xs text-gray-500 font-semibold truncate mt-0.5">{c.profession}</p>
                    <p className="text-[11px] text-gray-400 font-medium truncate">{c.company}</p>
                    
                    <div className="flex items-center gap-1 text-[11px] text-gray-400 mt-2">
                      <MapPin size={12} className="shrink-0 text-gray-300" />
                      <span className="truncate">{c.city}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between gap-3 shrink-0">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    {c.connectedSince}
                  </span>
                  <div className="flex items-center gap-2">
                    <Link 
                      href={`/profile/${c.id}`} 
                      className="px-3 py-1.5 border border-gray-200 text-gray-600 rounded-lg text-xs font-bold hover:bg-gray-50 active:scale-[0.98] transition-all cursor-pointer"
                    >
                      Profile
                    </Link>
                    <Link 
                      href="/messages"
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#e62e3d] hover:bg-[#d02432] text-white rounded-lg text-xs font-bold active:scale-[0.98] transition-all cursor-pointer"
                    >
                      <MessageSquare size={13} />
                      <span>Chat</span>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full text-center py-16 bg-white rounded-2xl border border-gray-200 shadow-sm">
              <UserCheck size={28} className="text-gray-300 mx-auto mb-2" />
              <p className="font-bold text-gray-900">No connections found</p>
              <p className="text-gray-400 text-xs mt-1">Try resetting your search query.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
