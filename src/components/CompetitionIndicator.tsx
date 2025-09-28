import React, { useState, useEffect } from 'react';
import { Users } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface CompetitionIndicatorProps {
  id: string;
}

type CompetitionLevel = 'low' | 'medium' | 'high';

interface CompetitionData {
  level: CompetitionLevel;
  label: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  tooltip: string;
}

const getCompetitionData = (count: number): CompetitionData => {
  if (count < 8) {
    return {
      level: 'low',
      label: 'Low competition',
      bgColor: 'bg-green-500',
      textColor: 'text-white',
      borderColor: 'border-green-400/50',
      tooltip: 'Few traders have unlocked this job.'
    };
  } else if (count <= 15) {
    return {
      level: 'medium',
      label: 'Medium competition',
      bgColor: 'bg-amber-500',
      textColor: 'text-white',
      borderColor: 'border-amber-400/50',
      tooltip: 'Several traders have unlocked this job.'
    };
  } else {
    return {
      level: 'high',
      label: 'High competition',
      bgColor: 'bg-red-500',
      textColor: 'text-white',
      borderColor: 'border-red-400/50',
      tooltip: 'Many traders have unlocked this job already.'
    };
  }
};

const CompetitionIndicator: React.FC<CompetitionIndicatorProps> = ({ id }) => {
  const [jobApplicationCount, setJobApplicationCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('show me the id', id);
    const makeRequest = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const request = await fetch(`${import.meta.env.VITE_API_URL}/travel/job-application-counter/${id}`);
        
        if (!request.ok) {
          throw new Error('Failed to get job application count');
        }
        
        let response = await request.json();
        setJobApplicationCount(response.count);
      } catch (err) {
        console.error('Error fetching job application count:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        // Set default count to 0 on error
        setJobApplicationCount(0);
      } finally {
        setIsLoading(false);
      }
    };

    makeRequest();
  }, [id]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm backdrop-blur-sm border bg-slate-200 text-slate-500 border-slate-300/50 animate-pulse">
        <Users className="w-3 h-3 inline mr-1" />
        Loading...
      </div>
    );
  }

  // Show error state (fallback to low competition)
  if (error) {
    console.warn('CompetitionIndicator error:', error);
  }

  const competitionData = getCompetitionData(jobApplicationCount);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm backdrop-blur-sm border cursor-help ${competitionData.bgColor} ${competitionData.textColor} ${competitionData.borderColor}`}>
            <Users className="w-3 h-3 inline mr-1" />
            {competitionData.label}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{competitionData.tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default CompetitionIndicator;
