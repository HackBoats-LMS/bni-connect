'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search, Send, Image, Smile, Phone, Video, Info, Loader2, RefreshCw, Compass } from 'lucide-react';
import { useAuthStore } from '@/stores/use-auth-store';
import { useLocationStore } from '@/stores/use-location-store';
import { Avatar } from '@/components/ui/avatar';
import type { NearbyMember } from '@/lib/types';

interface Message {
  id: string;
  sender: 'me' | 'them';
  text: string;
  time: string;
}

interface ChatMember {
  id: string;
  name: string;
  avatar: string;
  profession: string;
  availability: string;
  lastMessage?: string;
  time?: string;
}

function MessagesContent() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuthStore();
  const { coords } = useLocationStore();

  const [members, setMembers] = useState<ChatMember[]>([]);
  const searchParams = useSearchParams();
  const activeId = searchParams.get('chat');
  
  const setActiveId = (id: string | null) => {
    if (id) router.push(`/messages?chat=${id}`);
    else router.push(`/messages`);
  };

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);

  const activeMember = members.find((m) => m.id === activeId);
  const scrollRef = useRef<HTMLDivElement>(null);

  // (Removed imperative DOM manipulation for bottom nav)

  // Redirect if unauthorized
  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [user, authLoading, router]);

  // Load chat members from nearby members list
  useEffect(() => {
    async function loadMembers() {
      // Default to Bangalore coords if location isn't ready
      const lat = coords?.latitude ?? 12.9352;
      const lng = coords?.longitude ?? 77.6245;
      
      try {
        const res = await fetch(`/api/members?lat=${lat}&lng=${lng}&radius=100`);
        const data = await res.json();
        if (data.members) {
          const list: ChatMember[] = data.members.map((m: NearbyMember) => ({
            id: m.id,
            name: m.name,
            avatar: m.avatar,
            profession: m.profession,
            availability: m.availability,
            lastMessage: 'Tap to start talking',
            time: '',
          }));
          setMembers(list);
          if (list.length > 0) {
            // Only auto-select on desktop
            if (window.innerWidth >= 1024) {
              setActiveId(list[0].id);
            }
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingMembers(false);
      }
    }

    if (user) loadMembers();
  }, [user, coords]);

  // Fetch messages helper
  async function fetchMessages(otherId: string, showLoader = false) {
    if (showLoader) setLoadingMessages(true);
    try {
      const res = await fetch(`/api/messages?otherId=${otherId}`);
      const data = await res.json();
      if (data.messages) {
        setMessages(data.messages);
      }
    } catch (e) {
      console.error(e);
    } finally {
      if (showLoader) setLoadingMessages(false);
    }
  }

  // Load messages for selected conversation (only once on switch, no background polling intervals)
  useEffect(() => {
    if (activeId) {
      const timer = setTimeout(() => {
        fetchMessages(activeId, true);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [activeId]);

  // Auto scroll to bottom of chat on new messages
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeId || sending) return;

    setSending(true);
    const sentText = inputText;
    setInputText('');

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiverId: activeId, text: sentText }),
      });
      if (res.ok) {
        // Fetch new messages to update the stream
        await fetchMessages(activeId, false);
        
        // Update last message preview in sidebar
        setMembers(prev => prev.map(m => m.id === activeId ? { ...m, lastMessage: sentText, time: 'Just now' } : m));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSending(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 size={32} className="animate-spin text-[#e62e3d]" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-5rem)] bg-white flex font-sans overflow-hidden">
      
      {/* Chats Sidebar List */}
      <div className={`w-full lg:w-80 border-r border-gray-150 flex-col shrink-0 ${activeId ? 'hidden lg:flex' : 'flex'}`}>
        
        {/* Search header */}
        <div className="p-4 border-b border-gray-150 shrink-0">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search chats..."
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:bg-white focus:border-[#e62e3d] transition-all"
            />
          </div>
        </div>

        {/* Chats list */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
          {loadingMembers ? (
            <div className="p-4 space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="w-10 h-10 bg-gray-150 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-gray-150 rounded w-1/2"></div>
                    <div className="h-2 bg-gray-100 rounded w-3/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : members.length > 0 ? (
            members.map((c) => {
              const isSelected = c.id === activeId;
              return (
                <button 
                  key={c.id}
                  onClick={() => setActiveId(c.id)}
                  className={`w-full p-4 flex items-start gap-3.5 transition-all text-left hover:bg-gray-50/50 cursor-pointer ${
                    isSelected ? 'bg-[#fce9ea]/30 border-l-[3px] border-[#e62e3d]' : ''
                  }`}
                >
                  <Avatar name={c.name} avatar={c.avatar} size="md" showStatus status={c.availability} />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-bold text-xs text-gray-900 truncate">{c.name}</h4>
                      <span className="text-[9px] text-gray-400 font-bold shrink-0">{c.time}</span>
                    </div>
                    <p className="text-[11px] truncate mt-1 text-gray-400">
                      {c.lastMessage}
                    </p>
                  </div>
                </button>
              );
            })
          ) : (
            <div className="text-center py-12 px-4">
              <p className="text-xs text-gray-400 font-semibold">No professionals nearby to chat with</p>
            </div>
          )}
        </div>

      </div>

      {/* Main Chat Panel */}
      <div className={`flex-1 bg-gray-50/20 flex-col min-w-0 ${!activeId ? 'hidden lg:flex' : 'flex'}`}>
        
        {activeMember ? (
          <>
            {/* Chat header */}
            <div className="h-16 border-b border-gray-150 bg-white px-4 lg:px-6 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3.5 min-w-0">
                <button 
                  onClick={() => setActiveId(null)}
                  className="lg:hidden p-2 -ml-2 mr-1 text-gray-500 hover:bg-gray-100 rounded-full cursor-pointer"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
                </button>
                <Avatar name={activeMember.name} avatar={activeMember.avatar} size="md" showStatus status={activeMember.availability} />
                <div className="min-w-0">
                  <h4 className="font-bold text-sm text-gray-900 truncate">{activeMember.name}</h4>
                  <p className="text-[10px] text-gray-400 font-semibold truncate">{activeMember.profession}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-gray-400">
                <button 
                  onClick={() => activeId && fetchMessages(activeId, false)} 
                  title="Sync Chat"
                  className="hover:text-gray-600 transition-colors cursor-pointer p-1 rounded-lg hover:bg-gray-100"
                >
                  <RefreshCw size={16} />
                </button>
                <button className="hover:text-gray-600 transition-colors cursor-pointer"><Phone size={18} /></button>
                <button className="hover:text-gray-600 transition-colors cursor-pointer"><Video size={18} /></button>
                <div className="w-px h-4 bg-gray-200"></div>
                <button className="hover:text-gray-600 transition-colors cursor-pointer"><Info size={18} /></button>
              </div>
            </div>

            {/* Message Stream */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {loadingMessages ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 size={24} className="animate-spin text-[#e62e3d]" />
                </div>
              ) : messages.length > 0 ? (
                messages.map((m) => {
                  const isMe = m.sender === 'me';
                  return (
                    <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 shadow-sm text-xs ${
                        isMe 
                          ? 'bg-[#e62e3d] text-white rounded-tr-none' 
                          : 'bg-white text-gray-900 border border-gray-200 rounded-tl-none'
                      }`}>
                        <p className="leading-relaxed">{m.text}</p>
                        <span className={`text-[8px] font-semibold mt-1.5 block text-right ${
                          isMe ? 'text-white/60' : 'text-gray-400'
                        }`}>
                          {m.time}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-4">
                  <Compass size={24} className="text-gray-300 mb-2" />
                  <p className="text-xs font-bold text-gray-600">No messages yet</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">Send a message to start the conversation!</p>
                </div>
              )}
              <div ref={scrollRef} />
            </div>

            {/* Message Editor Input */}
            <div className="p-4 border-t border-gray-150 bg-white shrink-0">
              <form onSubmit={handleSend} className="flex items-center gap-3">
                <button type="button" className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"><Smile size={20} /></button>
                <button type="button" className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"><Image size={20} /></button>
                
                <input 
                  type="text" 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={`Message ${activeMember.name.split(' ')[0]}...`}
                  className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:bg-white focus:border-[#e62e3d] transition-all text-gray-900"
                />
                
                <button 
                  type="submit" 
                  disabled={sending || !inputText.trim()}
                  className="p-2.5 bg-[#e62e3d] hover:bg-[#d02432] text-white rounded-xl active:scale-[0.98] transition-all cursor-pointer shadow-sm shrink-0 disabled:opacity-50"
                >
                  <Send size={15} />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <Compass size={32} className="text-gray-300 mb-3" />
            <p className="font-bold text-gray-900">Select a conversation</p>
            <p className="text-xs text-gray-500 mt-1">Pick a professional from the list to start chatting.</p>
          </div>
        )}

      </div>

    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="h-full flex items-center justify-center bg-white"><Loader2 className="animate-spin text-[#e62e3d]" size={24} /></div>}>
      <MessagesContent />
    </Suspense>
  );
}
