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
  HiArrowTopRightOnSquare
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
}

const PaidUserBanner: React.FC<PaidUserBannerProps> = ({
  jobId,
  jobTitle,
  homeownerInfo,
  onOpenChat
}) => {

  const navigate = useNavigate();
  const authToken = localStorage.getItem('access_token'); 
  console.log('show me the authToken', authToken);

  const handleOpenFullChat = async () => {
    try {
      console.log('show me the jobId', jobId);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/travel/chat-component/get-conversation-by-id/${jobId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
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
      // window.location.href = '/chat';
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Success Banner */}
      <Card className="rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 border-green-200/50 p-6 md:p-8 shadow-lg mb-2">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-4">
            {/* Success Header */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                <HiCheckCircle className="w-6 h-6 md:w-7 md:h-7 text-white" />
              </div>
              <div>
                <h3 className="text-xl md:text-2xl font-bold text-green-900">Application Submitted!</h3>
                <p className="text-green-700 text-sm md:text-base">You have access to this job</p>
              </div>
            </div>

            {/* Benefits */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <HiSparkles className="w-4 h-4 text-green-600" />
                <span className="text-green-800 text-sm font-medium">Chat with homeowner</span>
              </div>
              <div className="flex items-center gap-2">
                <HiPhone className="w-4 h-4 text-green-600" />
                <span className="text-green-800 text-sm font-medium">Access contact details</span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleOpenFullChat}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
            >
              <HiChatBubbleLeftRight className="w-5 h-5 mr-2" />
              Open Chat
              <HiArrowTopRightOnSquare className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </Card>

    </div>
  );
};

export default PaidUserBanner;
