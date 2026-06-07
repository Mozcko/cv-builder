import { useEffect } from 'react';
import { useAuth } from '@clerk/astro/react';
import { api } from '../../lib/api';
import { initialCVData } from '../../types/cv';

export default function GuestSync() {
  const { getToken, userId, isLoaded } = useAuth();

  useEffect(() => {
    const syncGuestData = async () => {
      if (!isLoaded || !userId) return;

      const existingId = localStorage.getItem('cv-resume-id');
      if (existingId && existingId !== 'null') return;

      const guestDataStr = localStorage.getItem('cv-data');
      if (!guestDataStr) return;

      try {
        const guestData = JSON.parse(guestDataStr);

        if (JSON.stringify(guestData) === JSON.stringify(initialCVData)) {
          return;
        }

        const token = await getToken();
        console.log('🚀 Promoting guest data to cloud account...');

        const finalTitle =
          (guestData as { personal?: { role?: string } }).personal?.role || 'Mi CV';
        const newId = crypto.randomUUID();

        const result = await api.createCV(
          {
            id: newId,
            title: finalTitle,
            content: guestData,
            language: (guestData as { language?: string }).language || 'ES',
          },
          token
        );

        if (result) {
          console.log('✅ Guest data promoted successfully!');
          localStorage.setItem('cv-resume-id', result.id);
        }
      } catch (error) {
        console.error('❌ Error promoting guest data:', error);
      }
    };

    syncGuestData();
  }, [isLoaded, userId, getToken]);

  return null;
}
