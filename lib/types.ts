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
