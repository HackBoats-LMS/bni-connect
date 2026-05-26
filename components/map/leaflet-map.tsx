'use client';

import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getInitials, getAvatarColor, formatDistance } from '@/lib/utils';
import type { NearbyMember, LocationCoords } from '@/lib/types';

interface MapViewProps {
  userLocation: LocationCoords;
  members: NearbyMember[];
}

function MapUpdater({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  const lastCoords = useRef<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (typeof lat === 'number' && typeof lng === 'number' && !isNaN(lat) && !isNaN(lng)) {
      // Avoid calling flyTo on initial mount (when map dimensions may not be ready in DOM)
      // and only fly if the search coordinates have actually changed
      if (lastCoords.current && (lastCoords.current.lat !== lat || lastCoords.current.lng !== lng)) {
        try {
          const currentCenter = map.getCenter();
          if (currentCenter && !isNaN(currentCenter.lat) && !isNaN(currentCenter.lng)) {
            map.flyTo([lat, lng], 13, { duration: 1.5 });
          }
        } catch (e) {
          console.warn('Map center not ready for flyTo:', e);
        }
      }
      lastCoords.current = { lat, lng };
    }
  }, [lat, lng, map]);
  return null;
}

export default function LeafletMap({ userLocation, members }: MapViewProps) {
  // Safe center fallback with strict type checks to prevent Leaflet from mounting on NaN/invalid coordinate values
  const lat = typeof userLocation?.latitude === 'number' && !isNaN(userLocation.latitude) ? userLocation.latitude : 12.9352;
  const lng = typeof userLocation?.longitude === 'number' && !isNaN(userLocation.longitude) ? userLocation.longitude : 77.6245;
  const center: [number, number] = [lat, lng];

  const userIcon = L.divIcon({
    className: 'custom-leaflet-marker',
    html: `<div style="width:18px;height:18px;background:#dc2626;border:3px solid white;border-radius:50%;box-shadow:0 0 10px rgba(220,38,38,0.4);"></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });

  const getMemberIcon = (name: string) => {
    const color = getAvatarColor(name);
    const initials = getInitials(name);
    return L.divIcon({
      className: 'custom-leaflet-marker',
      html: `<div style="width:34px;height:34px;background:${color};border:2.5px solid white;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:white;cursor:pointer;font-family:'Inter',sans-serif;box-shadow:0 2px 8px rgba(0,0,0,0.15);transition:transform 0.2s;" onmouseover="this.style.transform='scale(1.15)'" onmouseout="this.style.transform='scale(1)'">${initials}</div>`,
      iconSize: [34, 34],
      iconAnchor: [17, 17],
      popupAnchor: [0, -17],
    });
  };

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden border border-border shadow-sm relative z-0">
      <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }} attributionControl={false} scrollWheelZoom={false}>
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
        />
        <MapUpdater lat={lat} lng={lng} />
        
        <Marker position={center} icon={userIcon} />

        {members.map(m => {
          const mLat = typeof m.latitude === 'number' ? m.latitude : parseFloat(m.latitude);
          const mLng = typeof m.longitude === 'number' ? m.longitude : parseFloat(m.longitude);
          if (isNaN(mLat) || isNaN(mLng)) return null;
          return (
            <Marker key={m.id} position={[mLat, mLng]} icon={getMemberIcon(m.name)}>
              <Popup closeButton={true}>
                <div style={{ fontFamily: "'Inter', sans-serif" }}>
                  <p style={{ fontWeight: 700, fontSize: '14px', marginBottom: '3px', color: '#0f0f0f' }}>{m.name}</p>
                  <p style={{ color: '#5f5f6b', fontSize: '12px', marginBottom: '2px' }}>{m.profession}</p>
                  <p style={{ color: '#9e9eab', fontSize: '12px', marginBottom: '5px' }}>{m.company}</p>
                  <p style={{ color: '#dc2626', fontSize: '12px', fontWeight: 600 }}>{formatDistance(m.distance)}</p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
