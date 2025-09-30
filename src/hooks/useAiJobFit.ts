import { useState, useEffect } from 'react';

interface AIJobFitResponse {
  jobId: string;
  traderId: string;
  summary: string;
  fit_score: number;
  effort_hours: { min: number; max: number };
  complexity: string;
  assumptions: string[];
  follow_up?: string[];
  confidence: number;
  disclaimer: string;
}

// Simple cache implementation
const jobFitCache = new Map<string, { data: AIJobFitResponse; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const useAiJobFit = (jobId: string) => {
  const [fitData, setFitData] = useState<AIJobFitResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJobFit = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Check cache first
        const cached = jobFitCache.get(jobId);
        if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
          setFitData(cached.data);
          setIsLoading(false);
          return;
        }

        const response = await fetch(`${import.meta.env.VITE_API_URL}/travel/trader-helper`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id: jobId }),
        });

        if (response.status === 401 || response.status === 403) {
          setError('Unauthorized');
          return;
        }

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        
        // Cache the response
        jobFitCache.set(jobId, { data, timestamp: Date.now() });
        
        setFitData(data);
      } catch (err) {
        console.error('Error fetching job fit:', err);
        setError('AI unavailable. Try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    if (jobId) {
      fetchJobFit();
    }
  }, [jobId]);

  return {
    fitData,
    isLoading,
    error,
    followUpQuestions: fitData?.follow_up || []
  };
};
