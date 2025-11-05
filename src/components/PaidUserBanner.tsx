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
  homeownerId?: string;
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
  homeownerId,
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
        console.log('Opening chat for job:', jobId);
        
        // Get current user ID
        const authUser = JSON.parse(localStorage.getItem('auth_user') || '{}');
        const currentUserId = authUser.id;
        
        // Try to get existing conversation
        let response = await fetch(`${import.meta.env.VITE_API_URL}/travel/chat-component/get-conversation-by-id/${jobId}`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        if (!response.ok) {
          console.log('Conversation not found, creating new one...');
          // If conversation doesn't exist, create it
          const createResponse = await fetch(`${import.meta.env.VITE_API_URL}/travel/chat-component/create-chat`, {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              job_id: jobId,
              trader_id: currentUserId,
              homeowner_id: homeownerId,
            })
          });
          
          if (!createResponse.ok) {
            throw new Error('Failed to create conversation');
          }
          
          response = createResponse;
        }
        
        const data = await response.json();
        console.log('Got conversation data:', data);
        
        // Navigate to the conversation
        const conversationId = data.conversation?.conversation_id || data.conversation_id;
        if (conversationId) {
          navigate(`/chat/${conversationId}`);
        } else {
          navigate(`/chat/${jobId}`);
        }
      } catch (error) {
        console.error('Error opening chat:', error);
        // Fallback to simple navigation
        navigate(`/chat/${jobId}`);
      }
    }
  };

  return (
    <div className="mb-6">
      {/* Contact Banner */}
      <Card className="rounded-2xl bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-50 border-2 border-blue-200 p-6 md:p-8 shadow-lg animate-in slide-in-from-bottom-4 duration-700">
        <div className="flex flex-col gap-6">
          {/* Contact Header */}
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0 animate-in zoom-in duration-500">
              <HiChatBubbleLeftRight className="w-7 h-7 md:w-8 md:h-8 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-1.5">Contact Homeowner</h3>
              <p className="text-gray-600 text-sm md:text-base">Get in touch to discuss the project details</p>
            </div>
          </div>

          {/* Action Items */}
          <div className="space-y-2.5">
            <button
              onClick={handleOpenFullChat}
              className="w-full flex items-center gap-3 p-4 bg-white hover:bg-blue-50 border border-blue-200 rounded-xl transition-all duration-200 hover:shadow-md hover:border-blue-300 group"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <HiChatBubbleLeftRight className="w-5 h-5 text-blue-700" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold text-gray-900">Chat with homeowner</p>
                <p className="text-xs text-gray-600">Start discussing the project</p>
              </div>
              <HiArrowTopRightOnSquare className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
            </button>

          </div>
        </div>
      </Card>

      {/* Primary CTA Button - Mobile */}
      <div style={{marginBottom: '0.5rem'}} className="md:hidden sticky bottom-4 z-10">
        <Button
          onClick={handleOpenFullChat}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold px-6 py-4 text-base rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
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
