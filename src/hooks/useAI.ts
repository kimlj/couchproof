'use client';

import { useState } from 'react';

type AIType = 'roast' | 'hype' | 'narrative' | 'personality';

export function useAI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const generate = async (type: AIType): Promise<string> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/ai/${type}`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error(`Failed to generate ${type}`);
      }

      const data = await response.json();
      return data.content;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { generate, loading, error };
}
