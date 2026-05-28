'use client';

import { useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getInitials, getAvatarColor, formatDistance } from '@/lib/utils';
import type { NearbyMember, LocationCoords } from '@/lib/types';

interface MapViewProps {
  userLocation: LocationCoords;
  members: NearbyMember[];
  mapCenter?: LocationCoords;
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
        map.setView([lat, lng], 13);
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
    const zoomCtrl = L.control.zoom({ position: 'bottomright' });
    zoomCtrl.addTo(map);
    return () => {
      zoomCtrl.remove();
    };
  }, [map]);

  return null;
}

export default function LeafletMap({ userLocation, members, mapCenter }: MapViewProps) {
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
      className: 'custom-leaflet-marker',
      html: `<div style="width:34px;height:34px;background:${color};border:2.5px solid white;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:white;cursor:pointer;font-family:'Inter',sans-serif;box-shadow:0 2px 8px rgba(0,0,0,0.15);transition:transform 0.2s;" onmouseover="this.style.transform='scale(1.15)'" onmouseout="this.style.transform='scale(1)'">${initials}</div>`,
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
    <div className="w-full h-full rounded-2xl overflow-hidden border border-border shadow-sm relative z-0">
      <MapContainer 
        center={center} 
        zoom={13} 
        style={{ height: '100%', width: '100%' }} 
        attributionControl={false} 
        scrollWheelZoom={false}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
        />
        <ZoomControlUpdater />
        <MapUpdater lat={viewLat} lng={viewLng} />
        
        <Marker position={center} icon={userIcon} />

        {validMembers.map(m => {
          const hasSeparateTravelLocation = isValidCoord(m.currentLatitude) && isValidCoord(m.currentLongitude) &&
            (Math.abs((m.currentLatitude as number) - (m.latitude as number)) > 0.0001 ||
             Math.abs((m.currentLongitude as number) - (m.longitude as number)) > 0.0001);

          return (
            <div key={m.id}>
              {/* Business base location marker */}
              <Marker position={[m.latitude as number, m.longitude as number]} icon={getMemberIcon(m.name)}>
                <Popup closeButton={true} autoPanPadding={[20, 140]}>
                  <div style={{ fontFamily: "'Inter', sans-serif" }}>
                    <p style={{ fontWeight: 700, fontSize: '14px', marginBottom: '3px', color: '#0f0f0f' }}>{m.name}</p>
                    <p style={{ color: '#5f5f6b', fontSize: '12px', marginBottom: '2px' }}>{m.profession}</p>
                    <p style={{ color: '#9e9eab', fontSize: '12px', marginBottom: '4px' }}>{m.company}</p>
                    {m.address && (
                      <p style={{ color: '#7f7f8f', fontSize: '11px', marginBottom: '4px', lineHeight: '1.3' }}>
                        📍 {m.address}
                      </p>
                    )}
                    {m.currentCity && m.city && m.currentCity.toLowerCase() !== m.city.toLowerCase() && (
                      <p style={{ 
                        color: '#e62e3d', 
                        fontSize: '10px', 
                        fontWeight: 700, 
                        backgroundColor: '#fce9ea', 
                        padding: '2px 6px', 
                        borderRadius: '4px', 
                        display: 'inline-block',
                        marginBottom: '4px'
                      }}>
                        ✈️ Traveling in {m.currentCity}
                      </p>
                    )}
                    {isValidCoord(m.distance) && (
                      <p style={{ color: '#dc2626', fontSize: '12px', fontWeight: 600 }}>{formatDistance(m.distance)}</p>
                    )}
                  </div>
                </Popup>
              </Marker>

              {/* Active presence traveling marker */}
              {hasSeparateTravelLocation && (
                <Marker position={[m.currentLatitude as number, m.currentLongitude as number]} icon={getTravelIcon()}>
                  <Popup closeButton={true} autoPanPadding={[20, 140]}>
                    <div style={{ fontFamily: "'Inter', sans-serif" }}>
                      <p style={{ fontWeight: 700, fontSize: '13px', marginBottom: '2px', color: '#e62e3d' }}>
                        ✈️ {m.name} (Active Travel Presence)
                      </p>
                      <p style={{ color: '#5f5f6b', fontSize: '11px', marginBottom: '2px' }}>
                        Currently active in <strong>{m.currentCity || 'another city'}</strong>
                      </p>
                      <p style={{ color: '#9e9eab', fontSize: '11px' }}>
                        Primary business base: {m.city || 'Bangalore'}
                      </p>
                    </div>
                  </Popup>
                </Marker>
              )}
            </div>
          );
        })}
      </MapContainer>
    </div>
  );
}
