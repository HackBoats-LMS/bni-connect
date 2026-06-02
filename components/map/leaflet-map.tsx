'use client';

import React, { useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getInitials, getAvatarColor, formatDistance } from '@/lib/utils';
import type { NearbyMember, LocationCoords } from '@/lib/types';

// Globally disable popup autoPan — prevents map from panning when a popup opens.
// This is set at the prototype level to bypass any react-leaflet prop handling issues.
L.Popup.prototype.options.autoPan = false;

interface MapViewProps {
  userLocation: LocationCoords;
  members: NearbyMember[];
  mapCenter?: LocationCoords;
  hideZoomControls?: boolean;
}

const DEFAULT_LAT = 12.9352;
const DEFAULT_LNG = 77.6245;

// Module-level icon cache so we don't recreate Leaflet DivIcons on every render
const iconCache = new Map<string, L.DivIcon>();

/** Strictly validate a coordinate value — must be a finite number, not NaN */
function isValidCoord(val: unknown): val is number {
  return typeof val === 'number' && isFinite(val) && !isNaN(val);
}


function MapUpdater({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  const lastCoords = useRef<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (!isValidCoord(lat) || !isValidCoord(lng)) return;

    const hasChanged = lastCoords.current &&
      (lastCoords.current.lat !== lat || lastCoords.current.lng !== lng);

    if (hasChanged) {
      try {
        // Use setView (instant) instead of flyTo (animated) to prevent
        // NaN corruption during React re-renders mid-animation
        map.setView([lat, lng], map.getZoom());
      } catch {
        // Silently ignore if map isn't ready
      }
    }

    lastCoords.current = { lat, lng };
  }, [lat, lng, map]);

  return null;
}

function ZoomControlUpdater() {
  const map = useMap();

  useEffect(() => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 1024;
    const zoomCtrl = L.control.zoom({ position: isMobile ? 'bottomright' : 'topleft' });
    zoomCtrl.addTo(map);
    return () => {
      zoomCtrl.remove();
    };
  }, [map]);

  return null;
}

function ResizeObserverUpdater() {
  const map = useMap();
  useEffect(() => {
    const observer = new ResizeObserver(() => {
      map.invalidateSize();
    });
    observer.observe(map.getContainer());
    return () => observer.disconnect();
  }, [map]);
  return null;
}

export default function LeafletMap({ userLocation, members, mapCenter, hideZoomControls }: MapViewProps) {
  // Guaranteed valid user coordinates
  const lat = isValidCoord(userLocation?.latitude) ? userLocation.latitude : DEFAULT_LAT;
  const lng = isValidCoord(userLocation?.longitude) ? userLocation.longitude : DEFAULT_LNG;
  const center: [number, number] = [lat, lng];

  // Separate viewport target for search — falls back to user location
  const viewLat = mapCenter && isValidCoord(mapCenter.latitude) ? mapCenter.latitude : lat;
  const viewLng = mapCenter && isValidCoord(mapCenter.longitude) ? mapCenter.longitude : lng;

  const userIcon = useMemo(() => L.divIcon({
    className: 'custom-leaflet-marker',
    html: `<div style="width:18px;height:18px;background:#dc2626;border:3px solid white;border-radius:50%;box-shadow:0 0 10px rgba(220,38,38,0.4);"></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  }), []);

  // Retrieve or create a cached member icon by name
  const getMemberIcon = (name: string) => {
    const cached = iconCache.get(name);
    if (cached) return cached;
    const color = getAvatarColor(name);
    const initials = getInitials(name);
    const icon = L.divIcon({
      className: 'custom-leaflet-marker leaflet-avatar-marker',
      html: `<div class="avatar-inner" style="width:34px;height:34px;background:${color};border:2.5px solid white;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:white;cursor:pointer;font-family:'Inter',sans-serif;box-shadow:0 2px 8px rgba(0,0,0,0.15);">${initials}</div>`,
      iconSize: [34, 34],
      iconAnchor: [17, 17],
      popupAnchor: [0, -17],
    });
    iconCache.set(name, icon);
    return icon;
  };

  const getTravelIcon = () => {
    return L.divIcon({
      className: 'custom-leaflet-marker active-travel-marker',
      html: `<div style="width:30px;height:30px;background:#e62e3d;border:2.5px solid white;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(230,46,61,0.4);font-size:13px;">✈️</div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
      popupAnchor: [0, -15],
    });
  };

  // Pre-filter members to only those with valid coordinates — never let NaN reach Leaflet
  const validMembers = useMemo(() =>
    members.filter(m => isValidCoord(m.latitude) && isValidCoord(m.longitude)),
    [members]
  );

  return (
    <div className="absolute inset-0 z-0">
      <MapContainer 
        center={center} 
        zoom={13} 
        style={{ height: '100%', width: '100%' }} 
        attributionControl={false} 
        scrollWheelZoom={true}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
        />
        <ResizeObserverUpdater />
        {mapCenter && <MapUpdater lat={viewLat} lng={viewLng} />}
        
        <Marker position={center} icon={userIcon} />

        {validMembers.map(m => {
          const hasSeparateTravelLocation = isValidCoord(m.currentLatitude) && isValidCoord(m.currentLongitude) &&
            (Math.abs((m.currentLatitude as number) - (m.latitude as number)) > 0.0001 ||
             Math.abs((m.currentLongitude as number) - (m.longitude as number)) > 0.0001);

          return (
            <React.Fragment key={m.id}>
              {/* Business base location marker */}
              <Marker position={[m.latitude as number, m.longitude as number]} icon={getMemberIcon(m.name)}>
                <Popup closeButton={true} autoPan={false}>
                  <div style={{ fontFamily: "'Inter', sans-serif", minWidth: '180px', padding: '4px' }}>
                    <div style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: '8px', marginBottom: '8px' }}>
                      <h3 style={{ fontWeight: 800, fontSize: '15px', color: '#111827', margin: '0 0 2px 0' }}>{m.company || m.name}</h3>
                      <p style={{ color: '#6b7280', fontSize: '12px', margin: 0, fontWeight: 500 }}>{m.profession}</p>
                      {m.company && m.company !== m.name && (
                        <p style={{ color: '#9ca3af', fontSize: '11px', margin: '2px 0 0 0' }}>Rep: {m.name}</p>
                      )}
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {(m.address || m.city) && (
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                          <span style={{ fontSize: '12px', marginTop: '1px' }}>📍</span>
                          <p style={{ color: '#4b5563', fontSize: '11px', margin: 0, lineHeight: 1.4, fontWeight: 500 }}>
                            {[m.address, m.city].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i).join(', ')}
                          </p>
                        </div>
                      )}
                      
                      {m.currentCity && m.city && m.currentCity.toLowerCase() !== m.city.toLowerCase() && (
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                          <span style={{ fontSize: '12px', marginTop: '1px' }}>✈️</span>
                          <p style={{ 
                            color: '#e62e3d', 
                            fontSize: '11px', 
                            fontWeight: 700, 
                            margin: 0
                          }}>
                            Traveling in {m.currentCity}
                          </p>
                        </div>
                      )}
                      
                      {isValidCoord(m.distance) && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', paddingTop: '8px', borderTop: '1px dashed #e5e7eb' }}>
                          <span style={{ fontSize: '12px' }}>🚗</span>
                          <p style={{ color: '#dc2626', fontSize: '12px', fontWeight: 700, margin: 0 }}>
                            {formatDistance(m.distance)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>

              {/* Active presence traveling marker */}
              {hasSeparateTravelLocation && (
                <Marker position={[m.currentLatitude as number, m.currentLongitude as number]} icon={getTravelIcon()}>
                  <Popup closeButton={true} autoPan={false}>
                    <div style={{ fontFamily: "'Inter', sans-serif", minWidth: '180px', padding: '4px' }}>
                      <div style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: '8px', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '14px' }}>✈️</span>
                          <h3 style={{ fontWeight: 800, fontSize: '15px', color: '#111827', margin: '0 0 2px 0' }}>{m.name}</h3>
                        </div>
                        <p style={{ color: '#e62e3d', fontSize: '11px', margin: 0, fontWeight: 700 }}>Active Travel Presence</p>
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div>
                          <p style={{ color: '#6b7280', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 2px 0', fontWeight: 600 }}>Currently Active In</p>
                          <p style={{ color: '#111827', fontSize: '13px', margin: 0, fontWeight: 700 }}>{m.currentCity || 'Another City'}</p>
                        </div>
                        
                        <div>
                          <p style={{ color: '#9ca3af', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 2px 0', fontWeight: 600 }}>Primary Business Base</p>
                          <p style={{ color: '#4b5563', fontSize: '12px', margin: 0, fontWeight: 500 }}>{m.city || 'Bangalore'}</p>
                        </div>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              )}
            </React.Fragment>
          );
        })}
      </MapContainer>
    </div>
  );
}
