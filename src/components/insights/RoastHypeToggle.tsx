'use client';

import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Flame, Sparkles } from 'lucide-react';

interface RoastHypeToggleProps {
  roastContent: string;
  hypeContent: string;
  onModeChange?: (mode: 'roast' | 'hype') => void;
}

export function RoastHypeToggle({ roastContent, hypeContent, onModeChange }: RoastHypeToggleProps) {
  const [mode, setMode] = useState<'roast' | 'hype'>('hype');

  const handleModeChange = (value: string) => {
    const newMode = value as 'roast' | 'hype';
    setMode(newMode);
    onModeChange?.(newMode);
  };

  return (
    <Tabs value={mode} onValueChange={handleModeChange} className="w-full">
      <TabsList className="grid w-full grid-cols-2 bg-slate-800/50 backdrop-blur-sm border border-slate-700/30 p-1">
        <TabsTrigger
          value="hype"
          className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500/20 data-[state=active]:to-green-500/20 data-[state=active]:text-emerald-400 data-[state=active]:border-emerald-500/30 text-slate-400 border border-transparent rounded-md transition-all"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Hype Me Up
        </TabsTrigger>
        <TabsTrigger
          value="roast"
          className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500/20 data-[state=active]:to-red-500/20 data-[state=active]:text-orange-400 data-[state=active]:border-orange-500/30 text-slate-400 border border-transparent rounded-md transition-all"
        >
          <Flame className="w-4 h-4 mr-2" />
          Roast Me
        </TabsTrigger>
      </TabsList>
      <TabsContent value="hype" className="mt-4">
        <div className="p-6 bg-emerald-500/10 backdrop-blur-sm rounded-xl border border-emerald-500/30">
          <p className="text-lg text-emerald-100 leading-relaxed">{hypeContent}</p>
        </div>
      </TabsContent>
      <TabsContent value="roast" className="mt-4">
        <div className="p-6 bg-orange-500/10 backdrop-blur-sm rounded-xl border border-orange-500/30">
          <p className="text-lg text-orange-100 leading-relaxed">{roastContent}</p>
        </div>
      </TabsContent>
    </Tabs>
  );
}
