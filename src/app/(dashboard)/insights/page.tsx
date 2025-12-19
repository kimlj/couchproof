'use client';

import { PageContainer } from '@/components/layout/PageContainer';
import { PersonalityCard } from '@/components/insights/PersonalityCard';
import { TraitRadar } from '@/components/insights/TraitRadar';
import { RoastHypeToggle } from '@/components/insights/RoastHypeToggle';
import { useStats } from '@/hooks/useStats';
import { useAI } from '@/hooks/useAI';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export default function InsightsPage() {
  const { traits, loading: statsLoading } = useStats();
  const { generate, loading: aiLoading } = useAI();
  const [roast, setRoast] = useState('Click generate to get roasted!');
  const [hype, setHype] = useState('Click generate to get hyped!');

  const handleGenerate = async () => {
    try {
      const [roastContent, hypeContent] = await Promise.all([
        generate('roast'),
        generate('hype'),
      ]);
      setRoast(roastContent);
      setHype(hypeContent);
    } catch (error) {
      console.error('Failed to generate AI content:', error);
    }
  };

  if (statsLoading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Insights"
      description="AI-powered personality analysis and motivation"
    >
      <div className="space-y-6">
        {traits && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PersonalityCard traits={traits} />
              <TraitRadar traits={traits} />
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-white/90">AI Motivation</h2>
                <Button
                  onClick={handleGenerate}
                  disabled={aiLoading}
                  className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white border-0"
                >
                  {aiLoading ? 'Generating...' : 'Generate New'}
                </Button>
              </div>
              <RoastHypeToggle roastContent={roast} hypeContent={hype} />
            </div>
          </>
        )}
      </div>
    </PageContainer>
  );
}
