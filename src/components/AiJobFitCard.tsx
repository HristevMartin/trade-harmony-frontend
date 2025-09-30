import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  HiCpuChip, 
  HiClock, 
  HiChartBarSquare, 
  HiExclamationTriangle,
  HiChevronDown,
  HiChevronUp,
  HiInformationCircle
} from 'react-icons/hi2';
import { useAiJobFit } from '@/hooks/useAiJobFit';

interface AiJobFitCardProps {
  jobId: string;
}

// Utility functions
export const formatPercent = (n: number): string => {
  return `${Math.round(n * 100)}%`;
};

export const scoreToColor = (score: number) => {
  if (score < 0.4) return {
    text: 'text-red-600',
    bg: 'bg-red-100',
    bar: 'bg-gradient-to-r from-red-400 to-red-500',
    border: 'border-red-200'
  };
  if (score < 0.7) return {
    text: 'text-amber-600',
    bg: 'bg-amber-100',
    bar: 'bg-gradient-to-r from-amber-400 to-amber-500',
    border: 'border-amber-200'
  };
  return {
    text: 'text-green-600',
    bg: 'bg-green-100',
    bar: 'bg-gradient-to-r from-green-400 to-green-500',
    border: 'border-green-200'
  };
};

export const scoreToBadge = (score: number) => {
  const colors = scoreToColor(score);
  return `${colors.bg} ${colors.text} ${colors.border}`;
};

const AiJobFitCard = ({ jobId }: AiJobFitCardProps) => {
  const { fitData, isLoading, error } = useAiJobFit(jobId);
  const [showAllAssumptions, setShowAllAssumptions] = useState(false);
  const [showError, setShowError] = useState(false);

  // Check feature flag
  const isFeatureEnabled = import.meta.env.VITE_FEATURE_AI_JOBFIT !== 'false';

  // Don't render if feature disabled or unauthorized
  if (!isFeatureEnabled || error === 'Unauthorized') {
    return null;
  }

  const getComplexityColor = (complexity: string) => {
    switch (complexity.toLowerCase()) {
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const capitalizeFirst = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const visibleAssumptions = fitData?.assumptions 
    ? (showAllAssumptions ? fitData.assumptions : fitData.assumptions.slice(0, 3))
    : [];

  if (isLoading) {
    return (
      <Card 
        className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 p-4 md:p-6 transition-shadow" 
        role="region"
        aria-labelledby="ai-jobfit-header"
        aria-live="polite" 
        aria-label="Loading AI job assessment"
      >
        <div className="animate-pulse">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-5 h-5 bg-slate-200 rounded"></div>
            <div className="h-6 bg-slate-200 rounded w-40"></div>
            <div className="w-4 h-4 bg-slate-200 rounded"></div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            <div className="lg:col-span-2 space-y-3">
              <div className="h-4 bg-slate-200 rounded w-full"></div>
              <div className="h-4 bg-slate-200 rounded w-4/5"></div>
              <div className="space-y-2 mt-4">
                <div className="h-3 bg-slate-200 rounded w-24"></div>
                <div className="h-3 bg-slate-200 rounded w-full"></div>
                <div className="h-3 bg-slate-200 rounded w-3/4"></div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="bg-slate-50 rounded-xl p-4">
                <div className="h-4 bg-slate-200 rounded w-20 mb-2"></div>
                <div className="h-2 bg-slate-200 rounded w-full"></div>
              </div>
              <div className="h-8 bg-slate-200 rounded"></div>
              <div className="h-6 bg-slate-200 rounded"></div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  if (error && error !== 'Unauthorized') {
    return (
      <Card className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 p-4 md:p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-700">
            <HiExclamationTriangle className="w-4 h-4" />
            <p className="text-sm font-medium">{error}</p>
          </div>
          {!showError && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowError(!showError)}
              className="text-xs text-slate-500 hover:text-slate-700"
            >
              Details
            </Button>
          )}
        </div>
        {showError && (
          <div className="mt-3 p-3 bg-slate-50 rounded-lg">
            <p className="text-xs text-slate-600">
              The AI assessment service is temporarily unavailable. Please check back in a few minutes.
            </p>
          </div>
        )}
      </Card>
    );
  }

  if (!fitData) {
    return null;
  }

  const scoreColors = scoreToColor(fitData.fit_score);

  return (
    <Card 
      className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 p-4 md:p-6 transition-shadow hover:shadow-md border-t-2 border-t-blue-100"
      role="region"
      aria-labelledby="ai-jobfit-header"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <HiCpuChip className="w-5 h-5 text-blue-600" />
        <h2 id="ai-jobfit-header" className="text-lg font-semibold text-slate-800">
          AI Job Fit for You
        </h2>
      </div>

      {/* Low fit score warning */}
      {typeof fitData.fit_score === 'number' && fitData.fit_score < 0.4 && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start gap-2">
            <HiExclamationTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-amber-800">
              May be outside your typical trade—consider skipping or collaborating.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6" aria-live="polite">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4">
          {/* Summary */}
          {fitData.summary && (
            <div>
              <p className="text-slate-700 leading-relaxed text-sm md:text-base">
                {fitData.summary}
              </p>
            </div>
          )}

          {/* Key Assumptions */}
          {fitData.assumptions && Array.isArray(fitData.assumptions) && fitData.assumptions.length > 0 && (
            <div>
              <h3 className="font-semibold text-slate-800 mb-2 text-sm">Key Assumptions</h3>
              <ul className="space-y-1" role="list">
                {visibleAssumptions.map((assumption, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-slate-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 flex-shrink-0" aria-hidden="true"></span>
                    <span>{assumption}</span>
                  </li>
                ))}
              </ul>
              {fitData.assumptions.length > 3 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAllAssumptions(!showAllAssumptions)}
                  className="mt-2 text-xs text-slate-500 hover:text-slate-700 p-0 h-auto"
                  aria-pressed={showAllAssumptions}
                  aria-expanded={showAllAssumptions}
                >
                  {showAllAssumptions ? (
                    <>
                      <HiChevronUp className="w-3 h-3 mr-1" aria-hidden="true" />
                      Show less
                    </>
                  ) : (
                    <>
                      <HiChevronDown className="w-3 h-3 mr-1" aria-hidden="true" />
                      Show {fitData.assumptions.length - 3} more
                    </>
                  )}
                </Button>
              )}
            </div>
          )}

        </div>

        {/* Sidebar Metrics */}
        <div className="space-y-4">
          {/* Fit Score */}
          {typeof fitData.fit_score === 'number' && (
            <div className="bg-slate-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-slate-800 text-sm">Fit Score</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${scoreColors.bg} ${scoreColors.text}`}>
                  {formatPercent(fitData.fit_score)}
                </span>
              </div>
              {/* Progress Bar */}
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${scoreColors.bar}`}
                  style={{ width: `${Math.max(0, Math.min(100, fitData.fit_score * 100))}%` }}
                  role="progressbar"
                  aria-valuenow={Math.round(fitData.fit_score * 100)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`Job fit score: ${formatPercent(fitData.fit_score)}`}
                ></div>
              </div>
            </div>
          )}

          {/* KPIs Row */}
          <div className="space-y-3">
            {/* Effort Hours */}
            {fitData.effort_hours && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HiClock className="w-4 h-4 text-slate-500" aria-hidden="true" />
                  <span className="text-sm font-medium text-slate-700">Effort</span>
                </div>
                <span className="text-sm font-semibold text-slate-900">
                  ~{fitData.effort_hours.min || 0}–{fitData.effort_hours.max || 0} hrs
                </span>
              </div>
            )}

            {/* Complexity */}
            {fitData.complexity && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HiChartBarSquare className="w-4 h-4 text-slate-500" aria-hidden="true" />
                  <span className="text-sm font-medium text-slate-700">Complexity</span>
                </div>
                <Badge className={`${getComplexityColor(fitData.complexity)} border text-xs`}>
                  {capitalizeFirst(fitData.complexity)}
                </Badge>
              </div>
            )}

          
          </div>
        </div>
      </div>

      {/* Footer Disclaimer */}
      {fitData.disclaimer && (
        <div className="mt-4 pt-3 border-t border-slate-100">
          <p className="text-xs text-slate-500 leading-relaxed">
            {fitData.disclaimer}
          </p>
        </div>
      )}
    </Card>
  );
};

export default AiJobFitCard;
