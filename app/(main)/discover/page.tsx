'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Map as MapIcon, List, Loader2, RefreshCw, Users, MapPin, Compass, Search, ChevronDown, ChevronUp } from 'lucide-react';
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
  const [mapFocus, setMapFocus] = useState<{latitude: number; longitude: number} | null>(null);
  const [isListExpanded, setIsListExpanded] = useState(true);

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
          setMapFocus({ latitude: latVal, longitude: lngVal });
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
    setMapFocus(null);
  };

  const isValidCoord = (val: unknown): val is number => {
    return typeof val === 'number' && isFinite(val) && !isNaN(val);
  };

  const handleSeeOnMap = (member: NearbyMember) => {
    const lat = member.latitude;
    const lng = member.longitude;
    
    if (isValidCoord(lat) && isValidCoord(lng)) {
      // Only pan the map — do NOT set searchCenter (which would trigger a refetch)
      setMapFocus({ latitude: lat, longitude: lng });
      // Close the list so the map is fully visible
      setIsListExpanded(false);
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
    <div className="h-[calc(100vh-5rem)] bg-white flex flex-col">
      
      {/* Header removed as it is now in layout.tsx */}

      {/* Main Responsive Dashboard Container */}
      <div className="flex-1 flex flex-col p-0">
        
        {/* DESKTOP IMMERSIVE VIEW: Full Map + Overlay Sidebar */}
        <div className="hidden lg:flex relative h-[calc(100vh-5rem)] w-full bg-white overflow-hidden shadow-sm">
          
          {/* Full Width Map Area */}
          <div className="flex-1 w-full h-full relative flex flex-col ">
            {!coords || isLocating ? (
              <MapSkeleton />
            ) : (
              <div className="w-full h-full relative">
                {/* Floating Search Bar over Map */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] w-[calc(100%-2rem)] max-w-md max-h-[calc(100vh-8rem)] flex flex-col pointer-events-none">
                  <div className="relative flex flex-col bg-white border border-gray-200 rounded-2xl shadow-xl p-2.5 gap-2.5 pointer-events-auto shrink-0">
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

                  {/* Embedded Nearby Businesses List (Dropdown style) */}
                  {filteredMembers.length > 0 && (
                    <div className="mt-2 bg-white/95 backdrop-blur-md border border-gray-200/60 rounded-2xl p-3 shadow-xl pointer-events-auto flex flex-col min-h-0 flex-1 transition-all duration-300">
                      <div 
                        className="flex items-center justify-between shrink-0 px-1 cursor-pointer"
                        onClick={() => setIsListExpanded(!isListExpanded)}
                      >
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-[13px] text-gray-900 tracking-tight select-none">Nearby Businesses</h3>
                          <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full select-none">{filteredMembers.length} found</span>
                        </div>
                        <button className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md hover:bg-gray-100">
                          {isListExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                      </div>

                      {isListExpanded && (
                        <div className="overflow-y-auto space-y-2 pr-1 shrink-1 min-h-0 custom-scrollbar mt-3">
                        {loading ? (
                          <div className="space-y-4 py-4">
                            {[...Array(3)].map((_, i) => (
                              <div key={i} className="flex items-center gap-3 animate-pulse px-1">
                                <div className="w-8 h-8 bg-gray-150 rounded-full shrink-0"></div>
                                <div className="flex-1 space-y-2">
                                  <div className="h-2.5 bg-gray-150 rounded w-1/2"></div>
                                  <div className="h-2 bg-gray-100 rounded w-3/4"></div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          filteredMembers.map((m) => {
                            const statusColor = getStatusColor(m.availability);
                            return (
                              <div 
                                key={m.id} 
                                onClick={() => handleSeeOnMap(m)}
                                className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-50/80 transition-colors border border-transparent hover:border-gray-100 cursor-pointer group"
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <Avatar name={m.company || m.name} avatar={m.avatar} size="sm" showStatus status={m.availability} />
                                  <div className="min-w-0">
                                    <h4 className="font-bold text-[13px] text-gray-900 truncate group-hover:text-[#e62e3d] transition-colors">{m.company || 'Unnamed Business'}</h4>
                                    <p className="text-[10px] text-gray-500 font-semibold truncate mt-0.5">{m.name} • {m.profession}</p>
                                  </div>
                                </div>
                                <div className="text-right shrink-0 ml-2">
                                  <span className="text-[10px] text-gray-400 font-semibold block">{m.distance !== undefined ? `${m.distance.toFixed(1)} km` : ''}</span>
                                  <span className="text-[9px] font-bold block mt-1 px-1.5 py-0.5 rounded-full inline-block" style={{ color: statusColor, backgroundColor: `${statusColor}15` }}>
                                    {m.availability}
                                  </span>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                      )}
                    </div>
                  )}
                </div>

                <MapView userLocation={coords} members={filteredMembers} mapCenter={mapFocus ?? searchCenter ?? undefined} />
                
                {/* Floating location card (matches bottom-left of screenshot) */}
                <div className="absolute bottom-6 left-6 z-[1000] bg-white border border-gray-150 rounded-2xl p-4 shadow-xl max-w-[280px] select-none">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{searchCity ? 'Viewing area' : 'You are in'}</span>
                  <div className="flex items-center justify-between gap-4 mt-0.5">
                    <p className="text-sm font-bold text-gray-900 truncate">{searchCity || city || 'Unknown location'}</p>
                    <button 
                      onClick={() => {
                        handleBackToMyLocation();
                        // Also center map back to user coords using mapFocus
                        if (coords) setMapFocus(coords);
                      }}
                      className="text-[10px] font-bold text-[#e62e3d] hover:underline cursor-pointer whitespace-nowrap bg-[#fce9ea] px-2 py-1 rounded-md"
                    >
                      My Location
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                    <span className="w-2 h-2 rounded-full bg-[#e62e3d] animate-pulse"></span>
                    <span className="text-xs font-bold text-[#e62e3d]">{filteredMembers.length} businesses nearby</span>
                  </div>
                </div>
              </div>
            )}


          </div>
        </div>


        {/* MOBILE VIEW Outlet (stacked tabs) */}
        <div className="lg:hidden w-full flex-1 flex flex-col relative z-0">
          {!coords || isLocating ? (
            <div className="p-4 flex-1">
              {view === 'map' ? <MapSkeleton /> : <MemberListSkeleton />}
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {view === 'map' ? (
                <motion.div key="map" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full relative h-[calc(100dvh-4rem)]">
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

                  <MapView userLocation={coords} members={filteredMembers} mapCenter={mapFocus ?? searchCenter ?? undefined} />
                </motion.div>
              ) : (
                <motion.div key="list" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4 p-4 max-w-lg mx-auto w-full pb-32">
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

      {/* Floating Toggle Pill (Mobile only) */}
      <div className="lg:hidden fixed bottom-28 left-1/2 -translate-x-1/2 z-40">
        <div className="flex items-center bg-white/95 backdrop-blur-xl p-1.5 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-200/80">
          <button onClick={() => setView('map')} className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-[13px] font-bold transition-all cursor-pointer ${view === 'map' ? 'bg-[#e62e3d] text-white shadow-md' : 'text-gray-500 hover:text-gray-900'}`}>
            <MapIcon size={16} /> Map
          </button>
          <button onClick={() => setView('list')} className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-[13px] font-bold transition-all cursor-pointer ${view === 'list' ? 'bg-[#e62e3d] text-white shadow-md' : 'text-gray-500 hover:text-gray-900'}`}>
            <List size={16} /> List
          </button>
        </div>
      </div>

    </div>
  );
}

