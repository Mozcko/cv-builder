import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/astro/react';
import { api } from '../lib/api';

export default function useProStatus() {
  const { userId, getToken, isLoaded } = useAuth();
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      if (!isLoaded || !userId) {
        setIsPro(false);
        setLoading(false);
        return;
      }

      try {
        const token = await getToken();
        const profile = await api.getUserProfile(token);
        setIsPro(profile.is_pro);
      } catch (error) {
        console.error('Error fetching pro status:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, [userId, isLoaded, getToken]);

  return { isPro, loading };
}
