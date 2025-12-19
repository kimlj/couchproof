'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { Sparkles } from 'lucide-react';

interface AIGenerationCardProps {
  title: string;
  endpoint: string;
  icon?: string;
}

export function AIGenerationCard({ title, endpoint, icon }: AIGenerationCardProps) {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const response = await fetch(endpoint, { method: 'POST' });
      const data = await response.json();
      setContent(data.content);
    } catch (error) {
      console.error('Failed to generate content:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 bg-slate-800/30 backdrop-blur-sm border-slate-700/30 hover:border-slate-600/50 transition-all">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2 text-white/90">
          {icon && <span>{icon}</span>}
          {title}
        </h3>
        <Button
          onClick={handleGenerate}
          disabled={loading}
          className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white border-0"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          {loading ? 'Generating...' : 'Generate'}
        </Button>
      </div>

      {loading && (
        <div className="py-8 flex justify-center">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {content && !loading && (
        <div className="p-4 bg-slate-700/30 backdrop-blur-sm rounded-xl border border-slate-600/30">
          <p className="text-sm leading-relaxed text-slate-200">{content}</p>
        </div>
      )}
    </Card>
  );
}
