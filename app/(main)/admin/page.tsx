'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/stores/use-auth-store';
import { ShieldCheck, XCircle, CheckCircle, Search, Loader2, Clock, User } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  profession: string;
  avatar: string;
  role: string;
  isApproved: boolean;
  createdAt: string;
}

export default function AdminPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuthStore();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved'>('all');

  useEffect(() => {
    if (!authLoading && user?.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await fetch('/api/admin/users');
        const data = await res.json();
        if (data.users) {
          setUsers(data.users);
        }
      } catch (err) {
        console.error('Failed to fetch users', err);
      } finally {
        setLoading(false);
      }
    }
    
    if (user?.role === 'admin') {
      fetchUsers();
    }
  }, [user]);

  const toggleApproval = async (userId: string, currentStatus: boolean) => {
    if (userId === 'admin_user_id') return; // protect default admin
    setUpdatingId(userId);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, isApproved: !currentStatus })
      });
      if (res.ok) {
        setUsers(users.map(u => u.id === userId ? { ...u, isApproved: !currentStatus } : u));
      }
    } catch (err) {
      console.error('Failed to update user', err);
    } finally {
      setUpdatingId(null);
    }
  };
  const toggleRole = async (userId: string, currentRole: string) => {
    if (userId === 'admin_user_id') return;
    setUpdatingId(userId);
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole })
      });
      if (res.ok) {
        setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      }
    } catch (err) {
      console.error('Failed to update role', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const deleteUser = async (userId: string) => {
    if (userId === 'admin_user_id') return;
    if (!confirm('Are you sure you want to permanently delete this user? This cannot be undone.')) return;
    
    setUpdatingId(userId);
    try {
      const res = await fetch(`/api/admin/users?userId=${userId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setUsers(users.filter(u => u.id !== userId));
      }
    } catch (err) {
      console.error('Failed to delete user', err);
    } finally {
      setUpdatingId(null);
    }
  };

  if (authLoading || user?.role !== 'admin') {
    return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-gray-400" /></div>;
  }

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          u.email.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    
    if (activeTab === 'pending') return !u.isApproved && u.role !== 'admin';
    if (activeTab === 'approved') return u.isApproved || u.role === 'admin';
    return true;
  });

  return (
    <div className="p-6 max-w-6xl mx-auto pb-24">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ShieldCheck className="text-[#e62e3d]" size={28} />
            User Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">Approve or revoke access for Nearby members.</p>
        </div>
        
        <div className="relative">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search users..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-64 pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#e62e3d] focus:ring-1 focus:ring-[#e62e3d]"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 mb-6 border-b border-gray-200 pb-4 overflow-x-auto hide-scrollbar">
        <button
          onClick={() => setActiveTab('all')}
          className={`shrink-0 px-4 py-2 text-sm font-bold rounded-xl transition-colors ${activeTab === 'all' ? 'bg-[#e62e3d] text-white' : 'text-gray-500 hover:bg-gray-100'}`}
        >
          All Users
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`shrink-0 flex items-center gap-1.5 px-4 py-2 text-sm font-bold rounded-xl transition-colors ${activeTab === 'pending' ? 'bg-[#e62e3d] text-white' : 'text-gray-500 hover:bg-gray-100'}`}
        >
          <Clock size={16} />
          Pending Approvals
        </button>
        <button
          onClick={() => setActiveTab('approved')}
          className={`shrink-0 flex items-center gap-1.5 px-4 py-2 text-sm font-bold rounded-xl transition-colors ${activeTab === 'approved' ? 'bg-[#e62e3d] text-white' : 'text-gray-500 hover:bg-gray-100'}`}
        >
          <CheckCircle size={16} />
          Approved Members
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50/80 text-xs uppercase text-gray-500 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-semibold">User</th>
                <th className="px-6 py-4 font-semibold">Role</th>
                <th className="px-6 py-4 font-semibold">Joined</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                    <Loader2 className="animate-spin mx-auto mb-2" size={24} />
                    Loading users...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500 font-medium">
                    No users found matching "{searchQuery}"
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <motion.tr 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }}
                    key={u.id} 
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={u.name || 'Unknown User'} avatar={u.avatar} size="sm" />
                        <div>
                          <p className="font-bold text-gray-900">{u.name || 'Unknown User'}</p>
                          <p className="text-xs text-gray-500">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md ${u.role === 'admin' ? 'bg-purple-50 text-purple-600' : 'bg-gray-100 text-gray-600'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      {u.role === 'admin' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-green-50 text-green-700 text-xs font-bold">
                          <CheckCircle size={14} /> Approved
                        </span>
                      ) : u.isApproved ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-green-50 text-green-700 text-xs font-bold">
                          <CheckCircle size={14} /> Approved
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-orange-50 text-orange-600 text-xs font-bold">
                          <Clock size={14} /> Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {u.role !== 'admin' && (
                          <button
                            onClick={() => toggleApproval(u.id, u.isApproved)}
                            disabled={updatingId === u.id}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                              u.isApproved 
                                ? 'text-gray-500 hover:bg-gray-100' 
                                : 'bg-[#e62e3d] text-white hover:bg-[#d02432]'
                            } disabled:opacity-50`}
                          >
                            {updatingId === u.id ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : u.isApproved ? (
                              <>Revoke</>
                            ) : (
                              <>Approve</>
                            )}
                          </button>
                        )}
                        {u.id !== 'admin_user_id' && (
                          <>
                            <button
                              onClick={() => toggleRole(u.id, u.role)}
                              disabled={updatingId === u.id}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-gray-500 hover:bg-gray-100 transition-colors disabled:opacity-50"
                            >
                              {updatingId === u.id ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : u.role === 'admin' ? (
                                'Revoke Admin'
                              ) : (
                                'Make Admin'
                              )}
                            </button>
                            <button
                              onClick={() => deleteUser(u.id)}
                              disabled={updatingId === u.id}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                            >
                              {updatingId === u.id ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                'Delete'
                              )}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
