'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, LogOut, Loader2, Check, Sparkles, User, Briefcase, Building2, AlignLeft } from 'lucide-react';
import { useAuthStore } from '@/stores/use-auth-store';
import { Avatar } from '@/components/ui/avatar';
import type { AvailabilityStatus } from '@/lib/types';

const statuses: AvailabilityStatus[] = ['Available', 'Busy', 'Traveling', 'Open to Meet'];

export default function SettingsPage() {
  const router = useRouter();
  const { user, isLoading, setUser, logout } = useAuthStore();
  const [form, setForm] = useState({ name: '', profession: '', company: '', bio: '', availability: '' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) router.push('/login');
    if (user) setForm({ name: user.name, profession: user.profession, company: user.company, bio: user.bio, availability: user.availability });
  }, [user, isLoading, router]);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch('/api/profile', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await res.json();
      if (res.ok && data.user) { setUser(data.user); setSaved(true); setTimeout(() => setSaved(false), 2000); }
    } catch {} finally { setSaving(false); }
  }

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 size={32} className="animate-spin text-[#e62e3d]" />
      </div>
    );
  }

  const fields = [
    { key: 'name', label: 'Full Name', type: 'text', icon: User },
    { key: 'profession', label: 'Profession', type: 'text', icon: Briefcase },
    { key: 'company', label: 'Company', type: 'text', icon: Building2 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-24 font-sans">
      
      {/* Mobile Top Header (hidden on desktop) */}
      <div className="bg-white border-b border-gray-150 px-6 py-4 sticky top-0 z-30 lg:hidden">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.back()} 
            className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} />
          </button>
          <h1 className="text-sm font-bold text-gray-800">Settings</h1>
        </div>
      </div>

      <div className="px-4 py-6 lg:p-8">
        <div className="max-w-[700px] mx-auto space-y-6">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            
            {/* User Profile Card Summary */}
            <div className="bg-white rounded-3xl border border-gray-200 p-6 flex items-center gap-4 shadow-sm">
              <Avatar name={form.name || user.name} size="lg" showStatus status={user.availability} />
              <div className="min-w-0">
                <p className="font-bold text-gray-900 text-lg leading-tight truncate">{user.name}</p>
                <p className="text-xs text-gray-400 font-semibold truncate mt-1">{user.email}</p>
              </div>
            </div>

            {/* Profile Fields Container */}
            <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm space-y-5">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-2">Edit Details</h3>
              
              {fields.map((f) => (
                <div key={f.key}>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">{f.label}</label>
                  <div className="relative">
                    <f.icon size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="text"
                      value={form[f.key as keyof typeof form]} 
                      onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} 
                      className="w-full px-4 py-2.5 pl-11 bg-gray-50/70 border border-gray-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-[#e62e3d] focus:ring-2 focus:ring-[#e62e3d]/15 transition-all text-gray-900" 
                    />
                  </div>
                </div>
              ))}
              
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Bio</label>
                <div className="relative">
                  <AlignLeft size={18} className="absolute left-3.5 top-5 text-gray-400" />
                  <textarea 
                    value={form.bio} 
                    onChange={(e) => setForm({ ...form, bio: e.target.value })} 
                    rows={4} 
                    className="w-full px-4 py-3 pl-11 bg-gray-50/70 border border-gray-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-[#e62e3d] focus:ring-2 focus:ring-[#e62e3d]/15 transition-all text-gray-900 resize-none" 
                    placeholder="Tell others about yourself..." 
                  />
                </div>
              </div>
            </div>

            {/* Availability Status Selection Panel */}
            <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-1.5">
                <Sparkles size={14} className="text-[#e62e3d]" />
                Select Availability Status
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {statuses.map((s) => {
                  const isSelected = form.availability === s;
                  return (
                    <button 
                      key={s} 
                      type="button"
                      onClick={() => setForm({ ...form, availability: s })}
                      className={`rounded-xl border p-3.5 text-xs font-bold text-center transition-all cursor-pointer ${
                        isSelected 
                          ? 'border-[#e62e3d] bg-[#fce9ea]/30 text-[#e62e3d] shadow-sm' 
                          : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Save & Logout Actions Panel */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button 
                onClick={handleSave} 
                disabled={saving} 
                className="w-full sm:flex-1 py-3 bg-[#e62e3d] hover:bg-[#d02432] text-white text-sm font-bold rounded-xl active:scale-[0.98] transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {saving ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : saved ? (
                  <><Check size={16} /> Changes Saved!</>
                ) : (
                  <><Save size={16} /> Save Changes</>
                )}
              </button>
              
              <button 
                onClick={() => { logout(); router.push('/'); }} 
                className="w-full sm:w-auto px-6 py-3 bg-white border border-gray-200 text-[#e62e3d] hover:bg-red-50/30 text-sm font-bold rounded-xl active:scale-[0.98] transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2"
              >
                <LogOut size={16} /> 
                <span>Sign Out</span>
              </button>
            </div>

          </motion.div>
        </div>
      </div>
    </div>
  );
}
