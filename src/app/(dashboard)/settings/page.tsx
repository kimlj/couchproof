'use client';

import { useState, useEffect } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { ProfileSettings } from '@/components/settings/ProfileSettings';
import { StravaConnection } from '@/components/settings/StravaConnection';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useRouter } from 'next/navigation';

type DbUser = {
  id: string;
  email: string;
  name: string | null;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  stravaId: string | null;
  stravaConnectedAt: string | null;
  lastStravaSync: string | null;
};

export default function SettingsPage() {
  const router = useRouter();
  const [dbUser, setDbUser] = useState<DbUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetch('/api/me');
        if (!response.ok) {
          router.push('/login');
          return;
        }
        const data = await response.json();
        setDbUser(data.user);
      } catch (error) {
        console.error('Error fetching user:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, [router]);

  const handleStravaConnect = () => {
    window.location.href = '/api/strava/connect';
  };

  const handleStravaDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect Strava?')) return;

    try {
      const response = await fetch('/api/strava/disconnect', { method: 'POST' });
      if (!response.ok) throw new Error('Disconnect failed');
      // Refresh user data
      const userResponse = await fetch('/api/me');
      const data = await userResponse.json();
      setDbUser(data.user);
    } catch (error) {
      console.error('Disconnect error:', error);
      alert('Failed to disconnect Strava');
    }
  };

  const handleStravaSync = async () => {
    if (!dbUser) return;

    setSyncing(true);
    try {
      const response = await fetch('/api/strava/sync', {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Sync failed');
      }

      const result = await response.json();
      alert(`Sync complete! ${result.synced} new activities, ${result.updated} updated.`);

      // Refresh user data
      const userResponse = await fetch('/api/me');
      const data = await userResponse.json();
      setDbUser(data.user);
    } catch (error) {
      console.error('Sync error:', error);
      alert(error instanceof Error ? error.message : 'Sync failed');
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" />
        </div>
      </PageContainer>
    );
  }

  if (!dbUser) {
    return null;
  }

  const isStravaConnected = !!dbUser.stravaId;

  return (
    <PageContainer title="Settings" description="Manage your account and integrations">
      <div className="space-y-6 max-w-2xl">
        <ProfileSettings
          user={{
            name: dbUser.name || dbUser.firstName || '',
            email: dbUser.email,
          }}
        />
        <StravaConnection
          connected={isStravaConnected}
          syncing={syncing}
          lastSync={dbUser.lastStravaSync}
          onConnect={handleStravaConnect}
          onDisconnect={handleStravaDisconnect}
          onSync={handleStravaSync}
        />
      </div>
    </PageContainer>
  );
}
