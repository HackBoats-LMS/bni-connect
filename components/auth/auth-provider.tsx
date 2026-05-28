'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/use-auth-store';
import { useLocationStore } from '@/stores/use-location-store';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, setUser, setLoading } = useAuthStore();

  // Sync user profile coordinates to location store on load/change
  useEffect(() => {
    if (user) {
      useLocationStore.getState().initializeFromUser(user);
    }
  }, [user]);

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      }
    }

    loadUser();
  }, [setUser, setLoading]);

  return <>{children}</>;
}
