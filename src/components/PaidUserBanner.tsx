import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  HiCheckCircle,
  HiChatBubbleLeftRight,
  HiPhone,
  HiEnvelope,
  HiSparkles,
  HiArrowTopRightOnSquare,
  HiUserGroup,
  HiXMark,
  HiClock,
  HiWrenchScrewdriver
} from 'react-icons/hi2';
import { useNavigate } from 'react-router-dom';

interface PaidUserBannerProps {
  jobId: string;
  jobTitle: string;
  homeownerInfo?: {
    first_name: string;
    email: string;
    phone: string;
  };
  onOpenChat: () => void;
  homeownerName?: string;
  homeownerVerified?: boolean;
  applicantCount?: number;
  jobStats?: {
    completed_jobs: number;
    in_progress_jobs: number;
    total_posted: number;
    total_cancelled: number;
  };
  location?: string;
  postedDate?: string;
}

const PaidUserBanner: React.FC<PaidUserBannerProps> = ({
  jobId,
  jobTitle,
  homeownerInfo,
  onOpenChat,
  homeownerName,
  homeownerVerified = false,
  applicantCount,
  jobStats,
  location,
  postedDate
}) => {

  const navigate = useNavigate();
  const authToken = localStorage.getItem('access_token'); 
  console.log('show me the authToken', authToken);

  const handleOpenFullChat = async () => {
    // Use the onOpenChat prop if provided, otherwise use default behavior
    if (onOpenChat) {
      onOpenChat();
    } else {
      // Fallback to internal implementation
      try {
        console.log('show me the jobId', jobId);
        const response = await fetch(`${import.meta.env.VITE_API_URL}/travel/chat-component/get-conversation-by-id/${jobId}`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch conversation');
        }
        const data = await response.json();
        console.log('show me the data', data);
        navigate(`/chat/${data.conversation.conversation_id}`);
      } catch (error) {
        console.error('Error opening chat:', error);
        // Fallback to simple navigation
        navigate(`/chat?job_id=${jobId}`);
      }
    }
  };

  return (
    <div className="space-y-5 md:space-y-6 animate-in fade-in duration-500">
      {/* Header Section - Homeowner Info */}
      {homeownerName && (
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2.5 flex-wrap">
            <p className="text-gray-900 font-bold text-lg md:text-xl tracking-tight">{homeownerName}</p>
            {homeownerVerified ? (
              <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium">
                <HiCheckCircle className="w-3.5 h-3.5" />
                Verified Client
              </Badge>
            ) : (
              <Badge className="bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium">
                <HiXMark className="w-3.5 h-3.5" />
                Unverified
              </Badge>
            )}
          </div>
          
          {/* Application Count Badge */}
          {applicantCount !== undefined && (
            <Badge className="bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-2 text-sm px-3 py-1.5 rounded-full font-semibold">
              <HiUserGroup className="w-4 h-4" />
              {applicantCount} {applicantCount === 1 ? 'application' : 'applications'}
            </Badge>
          )}
        </div>
      )}

      {/* Job Title and Meta Info */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 leading-tight">{jobTitle}</h1>
        {(location || postedDate) && (
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
            {location && (
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                {location}
              </span>
            )}
            {postedDate && (
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                Posted {postedDate}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Homeowner's Job Activity Stats */}
      {jobStats && (
        <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-2xl p-5 md:p-6 border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Homeowner's Job Activity</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="text-center p-4 bg-white rounded-xl border border-emerald-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-2">
                <HiCheckCircle className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="text-2xl md:text-3xl font-bold text-gray-900">{jobStats.completed_jobs}</div>
              <div className="text-xs text-gray-600 font-medium mt-1">Completed</div>
            </div>
            <div className="text-center p-4 bg-white rounded-xl border border-blue-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-2">
                <HiClock className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-2xl md:text-3xl font-bold text-gray-900">{jobStats.in_progress_jobs}</div>
              <div className="text-xs text-gray-600 font-medium mt-1">Active</div>
            </div>
            <div className="text-center p-4 bg-white rounded-xl border border-red-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-2">
                <HiXMark className="w-5 h-5 text-red-600" />
              </div>
              <div className="text-2xl md:text-3xl font-bold text-gray-900">{jobStats.total_cancelled}</div>
              <div className="text-xs text-gray-600 font-medium mt-1">Cancelled</div>
            </div>
            <div className="text-center p-4 bg-white rounded-xl border border-gray-300 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <HiWrenchScrewdriver className="w-5 h-5 text-gray-600" />
              </div>
              <div className="text-2xl md:text-3xl font-bold text-gray-900">{jobStats.total_posted}</div>
              <div className="text-xs text-gray-600 font-medium mt-1">Total Jobs</div>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-4 text-center">
            This shows the homeowner's job history on our platform
          </p>
        </div>
      )}

      {/* Success Banner */}
      <Card style={{ marginBottom: '0.5rem' }} className="rounded-2xl bg-gradient-to-br from-green-50 via-emerald-50 to-green-50 border-2 border-green-200 p-6 md:p-8 shadow-lg animate-in slide-in-from-bottom-4 duration-700">
        <div className="flex flex-col gap-6">
          {/* Success Header */}
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0 animate-in zoom-in duration-500">
              <HiCheckCircle className="w-7 h-7 md:w-8 md:h-8 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl md:text-2xl font-bold text-green-900 mb-1.5">Application Submitted!</h3>
              <p className="text-green-700/80 text-sm md:text-base">You have access to this job</p>
            </div>
          </div>

          {/* Action Items */}
          <div className="space-y-2.5">
            <button
              onClick={handleOpenFullChat}
              className="w-full flex items-center gap-3 p-4 bg-white hover:bg-green-50 border border-green-200 rounded-xl transition-all duration-200 hover:shadow-md hover:border-green-300 group"
            >
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                <HiChatBubbleLeftRight className="w-5 h-5 text-green-700" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold text-gray-900">Chat with homeowner</p>
                <p className="text-xs text-gray-600">Start discussing the project</p>
              </div>
              <HiArrowTopRightOnSquare className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition-colors" />
            </button>

          </div>
        </div>
      </Card>

      {/* Primary CTA Button - Mobile */}
      <div style={{marginBottom: '0.5rem'}} className="md:hidden sticky bottom-4 z-10">
        <Button
          onClick={handleOpenFullChat}
          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold px-6 py-4 text-base rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
          size="lg"
        >
          <HiChatBubbleLeftRight className="w-5 h-5 mr-2" />
          Open Chat
        </Button>
      </div>
    </div>
  );
};

export default PaidUserBanner;
