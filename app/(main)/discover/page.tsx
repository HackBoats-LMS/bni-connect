'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Map as MapIcon, List, Loader2, RefreshCw, Users, MapPin, Compass, Search } from 'lucide-react';
import { useAuthStore } from '@/stores/use-auth-store';
import { useLocationStore } from '@/stores/use-location-store';
import { MapView } from '@/components/map/map-view';
import { MemberCard } from '@/components/members/member-card';
import { Avatar } from '@/components/ui/avatar';
import { MemberListSkeleton, MapSkeleton } from '@/components/ui/skeleton';
import { getStatusColor } from '@/lib/utils';
import type { NearbyMember } from '@/lib/types';

export default function DiscoverPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuthStore();
  const { coords, city, isLocating, updateLocation } = useLocationStore();
  
  const [view, setView] = useState<'map' | 'list'>('map');
  const [members, setMembers] = useState<NearbyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchingLocation, setSearchingLocation] = useState(false);
  const [searchCenter, setSearchCenter] = useState<{latitude: number; longitude: number} | null>(null);
  const [searchCity, setSearchCity] = useState<string | null>(null);

  const handleSearchLocation = async () => {
    if (!searchQuery.trim()) return;
    setSearchingLocation(true);
    try {
      const res = await fetch(`/api/location/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const place = data[0];
        const latVal = parseFloat(place.lat);
        const lngVal = parseFloat(place.lon);
        
        if (!isNaN(latVal) && !isNaN(lngVal)) {
          setSearchCenter({ latitude: latVal, longitude: lngVal });
          const cityPart = place.address?.city || place.address?.town || place.display_name.split(',')[0];
          setSearchCity(cityPart);
          setSearchQuery('');
        }
      }
    } catch (e) {
      console.error('Search location error:', e);
    } finally {
      setSearchingLocation(false);
    }
  };

  const handleBackToMyLocation = () => {
    setSearchCenter(null);
    setSearchCity(null);
  };

  const isValidCoord = (val: unknown): val is number => {
    return typeof val === 'number' && isFinite(val) && !isNaN(val);
  };

  const handleSeeOnMap = (member: NearbyMember) => {
    const lat = member.latitude;
    const lng = member.longitude;
    
    if (isValidCoord(lat) && isValidCoord(lng)) {
      setSearchCenter({ latitude: lat, longitude: lng });
      setSearchCity(member.company || member.name);
    }
  };

  const [filterType, setFilterType] = useState<'all' | 'local' | 'traveling'>('all');

  const filteredMembers = members.filter(m => {
    const matchesSearch = 
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.profession.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.company.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    const isTraveling = !!(m.currentCity && m.city && m.currentCity.trim().toLowerCase() !== m.city.trim().toLowerCase());

    if (filterType === 'traveling') return isTraveling;
    if (filterType === 'local') return !isTraveling;
    return true;
  });

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [user, authLoading, router]);

  async function fetchMembers(force = false) {
    const lat = searchCenter ? searchCenter.latitude : coords?.latitude;
    const lng = searchCenter ? searchCenter.longitude : coords?.longitude;
    if (!lat || !lng) return;

    if (force) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await fetch(`/api/members?lat=${lat}&lng=${lng}&radius=50`);
      const data = await res.json();
      if (data.members) setMembers(data.members);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    Promise.resolve().then(() => {
      fetchMembers();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coords, searchCenter]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 size={32} className="animate-spin text-[#e62e3d]" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-gray-50/50 flex flex-col">
      
      {/* Mobile Top Header (hidden on desktop) */}
      <header className="bg-white border-b border-gray-150 px-6 py-4 sticky top-0 z-30 lg:hidden">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Discover</h1>
            <p className="text-xs text-gray-500 font-medium mt-0.5">{city || 'Finding location...'}</p>
          </div>
          
          <div className="flex items-center gap-1.5 bg-gray-50 p-1 rounded-full border border-gray-200">
            <button onClick={() => setView('map')} className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${view === 'map' ? 'bg-white text-[#e62e3d] shadow-sm' : 'text-gray-500'}`}>
              <MapIcon size={14} /> Map
            </button>
            <button onClick={() => setView('list')} className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${view === 'list' ? 'bg-white text-[#e62e3d] shadow-sm' : 'text-gray-500'}`}>
              <List size={14} /> List
            </button>
          </div>
        </div>
      </header>

      {/* Main Responsive Dashboard Container */}
      <div className="flex-1 p-4 lg:p-8">
        
        {/* DESKTOP SPLIT VIEW: Map (Left) + Sidebar (Right) */}
        <div className="hidden lg:grid lg:grid-cols-12 gap-8 h-[calc(100vh-10rem)] max-w-[1300px] mx-auto w-full">
          
          {/* Left Column - Large Map View */}
          <div className="lg:col-span-8 bg-white border border-gray-200 rounded-3xl overflow-hidden relative flex flex-col shadow-sm">
            {!coords || isLocating ? (
              <MapSkeleton />
            ) : (
              <div className="w-full h-full relative">
                {/* Floating Search Bar over Map */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] w-[calc(100%-2rem)] max-w-md">
                  <div className="relative flex flex-col bg-white border border-gray-200 rounded-2xl shadow-xl p-2.5 gap-2.5">
                    <div className="relative flex items-center px-1">
                      <Search size={16} className="text-gray-400 shrink-0 mr-2.5" />
                      <input 
                        type="text"
                        placeholder="Filter businesses, or search landmark..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSearchLocation();
                        }}
                        className="w-full text-xs font-semibold focus:outline-none text-gray-900 bg-transparent"
                      />
                      {searchingLocation ? (
                        <Loader2 size={14} className="animate-spin text-[#e62e3d] shrink-0" />
                      ) : searchQuery ? (
                        <button 
                          onClick={handleSearchLocation}
                          className="text-[10px] bg-[#e62e3d] hover:bg-[#d02432] text-white font-bold px-2.5 py-1.5 rounded-lg active:scale-95 transition-all cursor-pointer shrink-0"
                        >
                          Go
                        </button>
                      ) : null}
                    </div>

                    {/* Segmented Filter Control */}
                    <div className="flex border-t border-gray-100 pt-2.5 gap-1.5 w-full">
                      {(['all', 'local', 'traveling'] as const).map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setFilterType(type)}
                          className={`flex-1 text-[10px] font-bold py-1.5 px-2 rounded-lg transition-all capitalize select-none cursor-pointer text-center ${
                            filterType === type
                              ? 'bg-[#e62e3d]/10 text-[#e62e3d]'
                              : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {type === 'all' ? 'All Businesses' : type === 'local' ? 'Local Businesses' : '✈️ Traveling'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <MapView userLocation={coords} members={filteredMembers} mapCenter={searchCenter ?? undefined} />
                
                {/* Floating location card (matches bottom-left of screenshot) */}
                <div className="absolute bottom-6 left-6 z-[1000] bg-white border border-gray-150 rounded-2xl p-4 shadow-xl max-w-[280px] select-none">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{searchCity ? 'Viewing area' : 'You are in'}</span>
                  <div className="flex items-center justify-between gap-4 mt-0.5">
                    <p className="text-sm font-bold text-gray-900 truncate">{searchCity || city || 'Unknown location'}</p>
                    {searchCity && (
                      <button 
                        onClick={handleBackToMyLocation}
                        className="text-[10px] font-bold text-[#e62e3d] hover:underline cursor-pointer whitespace-nowrap"
                      >
                        Back to me
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                    <span className="w-2 h-2 rounded-full bg-[#e62e3d] animate-pulse"></span>
                    <span className="text-xs font-bold text-[#e62e3d]">{filteredMembers.length} businesses nearby</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Nearby Members Sidebar */}
          <div className="lg:col-span-4 flex flex-col justify-between h-full space-y-6">
            
            {/* Nearby Members Panel */}
            <div className="flex-1 bg-white border border-gray-200 rounded-3xl p-6 flex flex-col min-h-0 shadow-sm">
              <div className="flex items-center justify-between mb-5 shrink-0">
                <h3 className="font-bold text-[16px] text-gray-900 tracking-tight">Nearby Businesses</h3>
                <button onClick={() => setView('list')} className="text-xs font-bold text-[#e62e3d] hover:underline cursor-pointer">
                  View All
                </button>
              </div>

              {/* Members Scroll List */}
              <div className="flex-1 overflow-y-auto space-y-4 pr-1.5">
                {loading ? (
                  <div className="space-y-4 py-4">
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
                ) : filteredMembers.length > 0 ? (
                  filteredMembers.slice(0, 5).map((m) => {
                    const statusColor = getStatusColor(m.availability);
                    return (
                      <div 
                        key={m.id} 
                        onClick={() => handleSeeOnMap(m)}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50/80 transition-colors border border-transparent hover:border-gray-100 cursor-pointer"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <Avatar name={m.company || m.name} avatar={m.avatar} size="md" showStatus status={m.availability} />
                          <div className="min-w-0">
                            <h4 className="font-bold text-[14px] text-gray-900 truncate">{m.company || 'Unnamed Business'}</h4>
                            <p className="text-[11px] text-gray-500 font-semibold truncate mt-0.5">{m.name}</p>
                            <p className="text-[10px] text-gray-400 font-medium truncate">{m.profession}</p>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSeeOnMap(m);
                              }}
                              className="text-[10px] text-[#e62e3d] hover:text-[#d02432] font-bold hover:underline cursor-pointer block mt-1 text-left"
                            >
                              See on Map
                            </button>
                          </div>
                        </div>
                        <div className="text-right shrink-0 ml-2">
                          <span className="text-[11px] text-gray-400 font-semibold block">{m.distance !== undefined ? `${m.distance.toFixed(1)} km` : ''}</span>
                          <span className="text-[10px] font-bold block mt-1" style={{ color: statusColor }}>
                            {m.availability}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-12">
                    <p className="text-xs text-gray-400 font-semibold">No businesses nearby</p>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom: Enable Location Card (Matches screenshot layout) */}
            <div className="bg-white border border-gray-200 rounded-3xl p-6 text-center shadow-sm relative overflow-hidden shrink-0 select-none">
              <div className="w-10 h-10 bg-[#e62e3d]/10 text-[#e62e3d] rounded-full flex items-center justify-center mx-auto mb-3">
                <MapPin size={18} />
              </div>
              <h4 className="text-sm font-bold text-gray-900 mb-1">Enable precise location</h4>
              <p className="text-xs text-gray-500 leading-normal mb-4">Allow precise location to see more relevant nearby businesses.</p>
              <button 
                onClick={updateLocation} 
                disabled={isLocating}
                className="w-full py-2.5 bg-[#e62e3d] hover:bg-[#d02432] text-white text-xs font-bold rounded-xl active:scale-[0.98] transition-all cursor-pointer disabled:opacity-60"
              >
                {isLocating ? 'Updating...' : 'Enable Location'}
              </button>
            </div>

          </div>

        </div>

        {/* MOBILE VIEW Outlet (stacked tabs) */}
        <div className="lg:hidden w-full max-w-lg mx-auto">
          {!coords || isLocating ? (
            view === 'map' ? <MapSkeleton /> : <MemberListSkeleton />
          ) : (
            <AnimatePresence mode="wait">
              {view === 'map' ? (
                <motion.div key="map" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="h-[60vh] rounded-2xl border border-gray-200 overflow-hidden relative shadow-sm">
                  {/* Floating Search Bar over Map on Mobile */}
                  <div className="absolute top-4 left-4 right-4 z-[1000]">
                    <div className="relative flex items-center bg-white border border-gray-200 rounded-2xl shadow-xl px-3.5 py-2.5 gap-2.5">
                      <Search size={16} className="text-gray-400 shrink-0" />
                      <input 
                        type="text"
                        placeholder="Filter members, or search location..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSearchLocation();
                        }}
                        className="w-full text-xs font-semibold focus:outline-none text-gray-900 bg-transparent"
                      />
                      {searchingLocation ? (
                        <Loader2 size={14} className="animate-spin text-[#e62e3d] shrink-0" />
                      ) : searchQuery ? (
                        <button 
                          onClick={handleSearchLocation}
                          className="text-[10px] bg-[#e62e3d] hover:bg-[#d02432] text-white font-bold px-2.5 py-1.5 rounded-lg active:scale-95 transition-all cursor-pointer shrink-0"
                        >
                          Go
                        </button>
                      ) : null}
                    </div>
                  </div>

                  <MapView userLocation={coords} members={filteredMembers} mapCenter={searchCenter ?? undefined} />
                </motion.div>
              ) : (
                <motion.div key="list" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                  {/* Search Bar for Mobile List view */}
                  <div className="relative flex items-center bg-white border border-gray-200 rounded-2xl shadow-sm px-3.5 py-2.5 gap-2.5">
                    <Search size={16} className="text-gray-400 shrink-0" />
                    <input 
                      type="text"
                      placeholder="Filter by name, profession or company..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full text-xs font-semibold focus:outline-none text-gray-900 bg-transparent"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{filteredMembers.length} professionals nearby</p>
                    <button onClick={() => fetchMembers(true)} disabled={refreshing} className="flex items-center gap-1 text-xs font-bold text-[#e62e3d] cursor-pointer">
                      <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} /> Refresh
                    </button>
                  </div>
                  {loading && !refreshing ? (
                    <MemberListSkeleton />
                  ) : filteredMembers.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                      {filteredMembers.map((m, i) => <MemberCard key={m.id} member={m} index={i} />)}
                    </div>
                  ) : (
                    <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
                      <Users size={24} className="text-gray-300 mx-auto mb-3" />
                      <p className="font-bold text-gray-900">No members found</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>

      </div>

    </div>
  );
}

