'use client';

import dynamic from 'next/dynamic';
import type { NearbyMember, LocationCoords } from '@/lib/types';

interface MapViewProps {
  userLocation: LocationCoords;
  members: NearbyMember[];
}

const LeafletMap = dynamic(() => import('./leaflet-map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full rounded-2xl bg-surface border border-border flex flex-col items-center justify-center shadow-sm min-h-[300px]">
      <div className="w-8 h-8 border-4 border-red border-t-transparent rounded-full animate-spin"></div>
    </div>
  ),
});

export function MapView(props: MapViewProps) {
  return <LeafletMap {...props} />;
}
