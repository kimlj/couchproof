'use client';

import type { PersonalityTraits } from '@/lib/stats/types';
import { Card } from '@/components/ui/card';

interface TraitRadarProps {
  traits: PersonalityTraits;
}

export function TraitRadar({ traits }: TraitRadarProps) {
  const traitEntries = Object.entries(traits);
  const numTraits = traitEntries.length;
  const centerX = 100;
  const centerY = 100;
  const maxRadius = 80;

  // Calculate points for the polygon
  const points = traitEntries.map(([_, value], index) => {
    const angle = (index * 2 * Math.PI) / numTraits - Math.PI / 2;
    const radius = (value / 100) * maxRadius;
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    };
  });

  const polygonPoints = points.map((p) => `${p.x},${p.y}`).join(' ');

  // Grid lines
  const gridLevels = [20, 40, 60, 80, 100];

  return (
    <Card className="p-6 bg-slate-800/30 backdrop-blur-sm border-slate-700/30 hover:border-slate-600/50 transition-all">
      <h3 className="text-lg font-semibold mb-4 text-white/90">Trait Radar</h3>
      <div className="aspect-square flex items-center justify-center">
        <svg viewBox="0 0 200 200" className="w-full h-full max-w-[280px]">
          {/* Grid circles */}
          {gridLevels.map((level) => (
            <circle
              key={level}
              cx={centerX}
              cy={centerY}
              r={(level / 100) * maxRadius}
              fill="none"
              stroke="rgb(71 85 105 / 0.3)"
              strokeWidth="1"
            />
          ))}

          {/* Axis lines */}
          {traitEntries.map(([key], index) => {
            const angle = (index * 2 * Math.PI) / numTraits - Math.PI / 2;
            const x2 = centerX + maxRadius * Math.cos(angle);
            const y2 = centerY + maxRadius * Math.sin(angle);
            const labelX = centerX + (maxRadius + 15) * Math.cos(angle);
            const labelY = centerY + (maxRadius + 15) * Math.sin(angle);
            return (
              <g key={key}>
                <line
                  x1={centerX}
                  y1={centerY}
                  x2={x2}
                  y2={y2}
                  stroke="rgb(71 85 105 / 0.4)"
                  strokeWidth="1"
                />
                <text
                  x={labelX}
                  y={labelY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-slate-400 text-[8px]"
                >
                  {key.replace(/([A-Z])/g, ' $1').trim().slice(0, 8)}
                </text>
              </g>
            );
          })}

          {/* Data polygon */}
          <polygon
            points={polygonPoints}
            fill="url(#radarGradient)"
            fillOpacity="0.3"
            stroke="url(#radarStroke)"
            strokeWidth="2"
          />

          {/* Data points */}
          {points.map((point, index) => (
            <circle
              key={index}
              cx={point.x}
              cy={point.y}
              r="4"
              fill="rgb(34 211 238)"
              stroke="rgb(15 23 42)"
              strokeWidth="2"
            />
          ))}

          {/* Gradients */}
          <defs>
            <linearGradient id="radarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgb(34 211 238)" />
              <stop offset="100%" stopColor="rgb(168 85 247)" />
            </linearGradient>
            <linearGradient id="radarStroke" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgb(34 211 238)" />
              <stop offset="100%" stopColor="rgb(168 85 247)" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </Card>
  );
}
