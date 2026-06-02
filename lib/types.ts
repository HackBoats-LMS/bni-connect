export type AvailabilityStatus = 'Available' | 'Busy' | 'Traveling' | 'Open to Meet';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  profession: string;
  company: string;
  bio: string;
  avatar: string;
  city: string;
  availability: AvailabilityStatus;
  latitude: number | null;
  longitude: number | null;
  address?: string;
  currentLatitude?: number | null;
  currentLongitude?: number | null;
  currentCity?: string | null;
  distance?: number;
}

export interface AuthResponse {
  success: boolean;
  user?: UserProfile;
  token?: string;
  error?: string;
}

export interface LocationCoords {
  latitude: number;
  longitude: number;
}

export interface NearbyMember extends UserProfile {
  distance: number;
}

export interface Notification {
  id: string;
  type: 'profile_view' | 'connection_request' | 'message';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
}
