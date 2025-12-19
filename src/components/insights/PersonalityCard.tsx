'use client';

import { Card } from '@/components/ui/card';
import type { PersonalityTraits } from '@/lib/stats/types';

interface PersonalityCardProps {
  traits: PersonalityTraits;
}

const TRAIT_COLORS: Record<string, string> = {
  consistency: 'from-cyan-500 to-blue-500',
  endurance: 'from-purple-500 to-pink-500',
  speedDemon: 'from-orange-500 to-red-500',
  hillClimber: 'from-green-500 to-emerald-500',
  socialButterfly: 'from-yellow-500 to-amber-500',
};

export function PersonalityCard({ traits }: PersonalityCardProps) {
  return (
    <Card className="p-6 bg-slate-800/30 backdrop-blur-sm border-slate-700/30 hover:border-slate-600/50 transition-all">
      <h2 className="text-lg font-semibold mb-4 text-white/90">Your Running Personality</h2>
      <div className="space-y-4">
        {Object.entries(traits).map(([key, value]) => {
          const gradient = TRAIT_COLORS[key] || 'from-cyan-500 to-purple-500';
          return (
            <div key={key}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium capitalize text-slate-300">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                <span className="text-sm text-slate-400">{value}%</span>
              </div>
              <div className="h-2 bg-slate-700/30 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${gradient} transition-all`}
                  style={{ width: `${value}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
