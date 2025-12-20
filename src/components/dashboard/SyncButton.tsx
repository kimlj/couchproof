'use client';

import { useState } from 'react';
import { RefreshCw, Check, AlertCircle } from 'lucide-react';

export function SyncButton() {
  const [syncing, setSyncing] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runSync = async (fullSync = false) => {
    setSyncing(true);
    setError(null);
    setStatus(null);

    try {
      const url = fullSync ? '/api/strava/sync?full=true' : '/api/strava/sync';
      const res = await fetch(url, { method: 'POST' });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.message || 'Sync failed');
      }

      setStatus(`${data.synced} new, ${data.updated} updated, ${data.skipped} skipped`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sync failed');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Status indicator */}
      {syncing && (
        <span className="text-xs text-cyan-400 animate-pulse">
          Syncing...
        </span>
      )}
      {!syncing && status && !error && (
        <span className="text-xs text-emerald-400 flex items-center gap-1">
          <Check className="w-3 h-3" />
          {status}
        </span>
      )}
      {error && (
        <span className="text-xs text-red-400 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {error}
        </span>
      )}

      {/* Sync button */}
      <button
        onClick={() => runSync(false)}
        disabled={syncing}
        className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/50 transition-colors disabled:opacity-50"
        title="Sync new activities"
      >
        <RefreshCw className={`w-4 h-4 text-slate-400 ${syncing ? 'animate-spin' : ''}`} />
      </button>

      {/* Full sync button */}
      <button
        onClick={() => runSync(true)}
        disabled={syncing}
        className="px-2 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-xs text-cyan-400 transition-colors disabled:opacity-50"
        title="Full sync - fetches detailed data for all activities from Jan 1st"
      >
        {syncing ? 'Syncing...' : 'Full Sync'}
      </button>
    </div>
  );
}
