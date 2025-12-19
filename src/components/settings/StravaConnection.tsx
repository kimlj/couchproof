'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface StravaConnectionProps {
  connected: boolean;
  syncing?: boolean;
  lastSync?: string | null;
  onConnect: () => void;
  onDisconnect: () => void;
  onSync: () => void;
}

function formatLastSync(dateString: string | null | undefined): string {
  if (!dateString) return 'Never';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minutes ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString();
}

export function StravaConnection({
  connected,
  syncing = false,
  lastSync,
  onConnect,
  onDisconnect,
  onSync,
}: StravaConnectionProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="#FC4C02">
          <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
        </svg>
        <h2 className="text-lg font-semibold">Strava Connection</h2>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div className="flex-1">
          <p className="text-sm font-medium mb-1">
            {connected ? 'Connected to Strava' : 'Not connected'}
          </p>
          <p className="text-sm text-muted-foreground">
            {connected
              ? `Last synced: ${formatLastSync(lastSync)}`
              : 'Connect your Strava account to import your activities'}
          </p>
        </div>
        {connected ? (
          <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-slate-500/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        {connected ? (
          <>
            <Button onClick={onSync} disabled={syncing}>
              {syncing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Syncing...
                </>
              ) : (
                'Sync Now'
              )}
            </Button>
            <Button variant="outline" onClick={onDisconnect} disabled={syncing}>
              Disconnect
            </Button>
          </>
        ) : (
          <Button onClick={onConnect} className="bg-[#FC4C02] hover:bg-[#E34402] text-white">
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
            </svg>
            Connect Strava
          </Button>
        )}
      </div>
    </Card>
  );
}
