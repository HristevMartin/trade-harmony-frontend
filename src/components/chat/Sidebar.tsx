import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, X, Archive, ArchiveRestore } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import type { Conversation, UserRef, ChatItem } from './useChatStore';
import { useChats } from './useChatStore';

// Type for completed jobs data (based on your original example)
interface CompletedJob {
  _id?: {
    $oid: string;
  };
  userId: string;  // trader ID
  homeownerId: string;
  jobId: string;
  rating: number;
  comment: string;
  createdDate: {
    $date: string;
  };
  updatedDate: {
    $date: string;
  };
}

interface SidebarProps {
  conversation?: Conversation;
  counterparty?: UserRef;
  authToken: string | null;
  onClose?: () => void;
  currentConversationId?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  conversation, 
  counterparty,
  authToken,
  onClose,
  currentConversationId
}) => {
  const navigate = useNavigate();
  const { chats, isLoading, error, fetchChats } = useChats();
  const [showArchived, setShowArchived] = useState(false);
  const [completedJobs, setCompletedJobs] = useState<CompletedJob[]>([]);
  
  // Debug logging
  console.log('Sidebar render - chats:', chats.length, 'isLoading:', isLoading, 'error:', error, 'completedJobs:', completedJobs.length);

  // Fetch completed jobs data
  useEffect(() => {
    const fetchCompletedJobs = async () => {
      console.log('=== FETCHING COMPLETED JOBS ===');
      console.log('Auth token available:', !!authToken);
      
      if (!authToken) {
        console.log('No auth token, skipping completed jobs fetch');
        return;
      }
      
      try {
        const apiUrl = import.meta.env.VITE_API_URL;
        console.log('API URL:', apiUrl);
        console.log('Fetching from:', `${apiUrl}/travel/past-jobs`);
        
        const response = await fetch(`${apiUrl}/travel/past-jobs`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);
        
        if (response.ok) {
          const data = await response.json();
          console.log('Completed jobs data:', data);
          
          // Extract completed jobs from the response
          let completedJobsData = [];
          if (data.ratings && Array.isArray(data.ratings)) {
            completedJobsData = data.ratings;
            console.log('Found ratings array:', completedJobsData);
          } else if (Array.isArray(data)) {
            completedJobsData = data;
            console.log('Data is already an array:', completedJobsData);
          } else {
            console.warn('No valid completed jobs data found:', data);
            completedJobsData = [];
          }
          
          console.log('Setting completed jobs:', completedJobsData);
          console.log('Completed jobs count:', completedJobsData.length);
          if (completedJobsData.length > 0) {
            console.log('First completed job structure:', completedJobsData[0]);
          }
          setCompletedJobs(completedJobsData);
        } else {
          console.error('Failed to fetch completed jobs:', response.status, response.statusText);
          setCompletedJobs([]);
        }
      } catch (error) {
        console.error('Error fetching completed jobs:', error);
        setCompletedJobs([]);
      }
    };

    fetchCompletedJobs();
  }, [authToken]);

  useEffect(() => {
    console.log('Sidebar useEffect triggered, authToken:', !!authToken, 'authToken value:', authToken);
    if (authToken) {
      console.log('Calling fetchChats from Sidebar');
      fetchChats(authToken);
    } else {
      console.log('No authToken, not calling fetchChats');
    }
  }, [authToken]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  // Generate consistent background color based on user ID
  const getAvatarColor = (userId: string) => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500',
      'bg-indigo-500', 'bg-red-500', 'bg-yellow-500', 'bg-teal-500',
      'bg-orange-500', 'bg-cyan-500'
    ];
    
    // Simple hash function to get consistent color
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = ((hash << 5) - hash + userId.charCodeAt(i)) & 0xffffffff;
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const formatLastMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      const minutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return minutes < 1 ? 'now' : `${minutes}m`;
    } else if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    } else if (diffInHours < 168) { // Within a week
      const days = Math.floor(diffInHours / 24);
      return `${days}d`;
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const handleChatClick = (chat: ChatItem) => {
    navigate(`/chat/${chat.conversation_id}`);
    if (onClose) {
      onClose();
    }
  };

  // Skeleton loader component
  const ConversationSkeleton = () => (
    <div className="p-4 space-y-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-start gap-3">
          <Skeleton className="w-12 h-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-12" />
            </div>
            <Skeleton className="h-3 w-48" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="w-full bg-muted/30 flex flex-col overflow-hidden h-full border-r border-border">
      {/* Mobile header with close button */}
      {onClose && (
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur-sm">
          <h2 className="font-semibold text-lg text-foreground flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-gray-700" />
            Conversations
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onClose();
              setTimeout(() => {
                const conversationsTrigger = document.querySelector('[aria-label="Open conversations"]') as HTMLElement;
                conversationsTrigger?.focus();
              }, 100);
            }}
            className="min-h-[40px] min-w-[40px] rounded-lg hover:bg-muted/50 transition-colors"
            aria-label="Close conversations"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      )}
      
      {/* Desktop header */}
      {!onClose && (
        <div className="p-4 lg:p-6 border-b bg-background/80 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground text-lg flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg transition-colors duration-200 hover:bg-primary/15">
                <MessageCircle className="w-5 h-5 text-gray-700 transition-colors duration-200" />
              </div>
              Conversations
            </h3>
            {chats.length > 0 && (
              <Badge variant="secondary" className="text-xs px-2 py-1 bg-primary/10 text-primary">
                {chats.length}
              </Badge>
            )}
          </div>
        </div>
      )}
      
      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <ConversationSkeleton />
        ) : error ? (
          <div className="text-center py-12 px-6">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <MessageCircle className="w-8 h-8 text-red-500" />
            </div>
            <h4 className="font-semibold text-foreground mb-2">Failed to load conversations</h4>
            <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
              There was a problem loading your conversations. Please try again.
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => authToken && fetchChats(authToken)}
              disabled={!authToken}
              className="text-sm"
            >
              Try Again
            </Button>
          </div>
        ) : chats.length === 0 ? (
          <div className="text-center py-16 px-6">
            <div className="w-20 h-20 bg-gradient-to-br from-primary/10 to-primary/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <MessageCircle className="w-10 h-10 text-primary/60" />
            </div>
            <h4 className="font-semibold text-foreground text-lg mb-3">No conversations yet</h4>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-sm mx-auto">
              Your conversations will appear here when you start chatting with homeowners about projects.
            </p>
          </div>
        ) : (
          <div className="p-2">
            {(() => {
              // Helper function to check if a job is completed
              // ANY chat that appears in the past-jobs endpoint should be marked as past job
              const isJobCompleted = (chat: ChatItem) => {
                // TEMPORARY TEST: Force the first chat to be marked as completed
                if (chats.length > 0 && chat.conversation_id === chats[0].conversation_id) {
                  console.log('TESTING: Forcing first chat to be completed');
                  return true;
                }
                
                if (!completedJobs || !Array.isArray(completedJobs)) {
                  console.log('No completed jobs data available');
                  return false;
                }
                
                const isCompleted = completedJobs.some(completed => {
                  // Check multiple possible field combinations
                  const completedJobId = completed.jobId || completed.job_id;
                  const completedTraderId = completed.userId || completed.trader_id || completed.user_id;
                  const completedHomeownerId = completed.homeownerId || completed.homeowner_id;
                  const completedConversationId = completed.conversation_id;
                  
                  // Match by conversation ID (most reliable)
                  const conversationMatch = completedConversationId === chat.conversation_id;
                  
                  // Match by job ID and trader ID (for trader view)
                  const jobAndTraderMatch = completedJobId === chat.job_id && completedTraderId === chat.counterparty?.id;
                  
                  // Match by job ID and homeowner ID (for homeowner view)
                  const jobAndHomeownerMatch = completedJobId === chat.job_id && completedHomeownerId === chat.counterparty?.id;
                  
                  // Match by job ID only (fallback)
                  const jobOnlyMatch = completedJobId === chat.job_id;
                  
                  const isCompleted = conversationMatch || jobAndTraderMatch || jobAndHomeownerMatch || jobOnlyMatch;
                  
                  console.log('Checking job completion:', {
                    chatJobId: chat.job_id,
                    chatCounterpartyId: chat.counterparty?.id,
                    chatConversationId: chat.conversation_id,
                    completedJobId: completedJobId,
                    completedTraderId: completedTraderId,
                    completedHomeownerId: completedHomeownerId,
                    completedConversationId: completedConversationId,
                    completedObject: completed,
                    conversationMatch,
                    jobAndTraderMatch,
                    jobAndHomeownerMatch,
                    jobOnlyMatch,
                    isCompleted
                  });
                  
                  return isCompleted;
                });
                
                console.log(`Job ${chat.job_id} is completed:`, isCompleted);
                return isCompleted;
              };

              // Group chats by trader_id
              const groupedChats = chats.reduce((acc: { [key: string]: ChatItem[] }, chat) => {
                const traderId = chat.counterparty?.id || 'unknown';
                if (!acc[traderId]) {
                  acc[traderId] = [];
                }
                acc[traderId].push(chat);
                return acc;
              }, {});

              // Debug: Log all the data we're working with
              console.log('=== DEBUGGING JOB SEPARATION ===');
              console.log('Current chats:', chats);
              console.log('Completed jobs data:', completedJobs);
              console.log('Grouped chats:', groupedChats);
              
              // Log individual chat details
              chats.forEach((chat, index) => {
                console.log(`Chat ${index}:`, {
                  conversation_id: chat.conversation_id,
                  job_id: chat.job_id,
                  counterparty_id: chat.counterparty?.id,
                  counterparty_name: chat.counterparty?.name,
                  fullChatObject: chat
                });
              });

              // Separate active and past jobs based on completion status
              const activeChats: ChatItem[] = [];
              const pastJobs: ChatItem[] = [];

              Object.values(groupedChats).forEach(traderChats => {
                // Sort by most recent first
                const sortedChats = traderChats.sort((a, b) => {
                  const aTime = new Date(a.last_message_at || a.created_at || 0).getTime();
                  const bTime = new Date(b.last_message_at || b.created_at || 0).getTime();
                  return bTime - aTime;
                });

                // Separate based on completion status
                sortedChats.forEach(chat => {
                  const isCompleted = isJobCompleted(chat);
                  console.log(`Processing chat ${chat.conversation_id} for trader ${chat.counterparty?.id}, job ${chat.job_id}: isCompleted = ${isCompleted}`);
                  
                  if (isCompleted) {
                    console.log(`Adding to pastJobs: ${chat.conversation_id}`);
                    pastJobs.push(chat);
                  } else {
                    // Only show the most recent active chat per trader
                    if (!activeChats.find(activeChat => activeChat.counterparty?.id === chat.counterparty?.id)) {
                      console.log(`Adding to activeChats: ${chat.conversation_id}`);
                      activeChats.push(chat);
                    }
                  }
                });
              });

              const chatsToShow = showArchived ? pastJobs : activeChats;
              const hasArchivedChats = pastJobs.length > 0;

              return (
                <>
                  {/* Tab Headers */}
                  <div className="flex mb-4 bg-muted/30 rounded-lg p-1">
                    <button
                      onClick={() => setShowArchived(false)}
                      className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all ${
                        !showArchived
                          ? 'bg-background text-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      Active Jobs ({activeChats.length})
                    </button>
                    <button
                      onClick={() => setShowArchived(true)}
                      className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all ${
                        showArchived
                          ? 'bg-background text-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      Past Jobs ({pastJobs.length})
                    </button>
                  </div>

                  {/* Active Chats */}
                  {!showArchived && activeChats.map((chat) => {
                    const isActive = currentConversationId === chat.conversation_id;
                    const initials = getInitials(chat.counterparty?.name || 'Unknown');
                    const hasUnread = chat.unread_count && chat.unread_count > 0;
              
                return (
                  <button
                    key={chat.conversation_id}
                    onClick={() => handleChatClick(chat)}
                  className={`relative w-full p-4 mb-2 rounded-xl text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 group ${
                    isActive 
                      ? 'bg-primary/8 border border-primary/20 shadow-sm' 
                      : 'hover:bg-muted/50 border border-transparent hover:border-border/30'
                  }`}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-12 bg-primary rounded-r-full"></div>
                  )}
                  
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <Avatar className="w-12 h-12 ring-2 ring-background shadow-sm">
                        {chat.counterparty?.avatar_url ? (
                          <AvatarImage src={chat.counterparty.avatar_url} alt={chat.counterparty?.name || 'Unknown'} />
                        ) : null}
                        <AvatarFallback className={`${getAvatarColor(chat.counterparty?.id || '')} text-white text-sm font-semibold`}>
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Header row */}
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex-1 min-w-0 mr-3">
                          <h4 className={`font-semibold truncate text-sm text-foreground ${hasUnread ? 'font-bold' : ''}`}>
                            {chat.counterparty?.name || 'Unknown'}
                          </h4>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-xs text-muted-foreground font-medium">
                            {formatLastMessageTime(chat.last_message_at)}
                          </span>
                          {hasUnread && chat.unread_count > 0 && (
                            <Badge className="bg-primary text-primary-foreground text-xs px-2 py-0.5 min-w-[20px] h-5 rounded-full flex items-center justify-center">
                              {chat.unread_count > 99 ? '99+' : chat.unread_count}
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      {/* Job title */}
                      {chat.counterparty?.job_title && (
                        <p className={`text-sm truncate mb-3 ${hasUnread ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                          {chat.counterparty.job_title}
                        </p>
                      )}
                      
                      {/* Message count */}
                      {Number(chat.message_count) > 0 && (
                        <p className="text-xs text-muted-foreground">
                          {Number(chat.message_count)} message{Number(chat.message_count) !== 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
                  );
                })}


                  {/* Past Jobs */}
                  {showArchived && (
                    pastJobs.length > 0 ? (
                      pastJobs.map((chat) => {
                    const isActive = currentConversationId === chat.conversation_id;
                    const initials = getInitials(chat.counterparty?.name || 'Unknown');
                    const hasUnread = chat.unread_count && chat.unread_count > 0;
              
                    return (
                      <button
                        key={chat.conversation_id}
                        onClick={() => handleChatClick(chat)}
                        className={`relative w-full p-4 mb-2 rounded-xl text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 group ${
                          isActive 
                            ? 'bg-primary/8 border border-primary/20 shadow-sm' 
                            : 'hover:bg-muted/50 border border-transparent hover:border-border/30'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="relative flex-shrink-0">
                            <Avatar className="h-12 w-12 border-2 border-background shadow-sm">
                              <AvatarImage src={chat.counterparty?.avatar_url} />
                              <AvatarFallback className={`${getAvatarColor(chat.counterparty?.id || 'default')} text-white font-semibold`}>
                                {initials}
                              </AvatarFallback>
                            </Avatar>
                            {hasUnread && chat.unread_count > 0 && (
                              <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold border-2 border-background">
                                {chat.unread_count}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className={`font-semibold text-sm truncate ${hasUnread ? 'text-foreground' : 'text-foreground'}`}>
                                {chat.counterparty?.name || 'Unknown'}
                              </h3>
                              <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                                {formatLastMessageTime(chat.last_message_at || chat.created_at)}
                              </span>
                            </div>
                            
                            {/* Job title */}
                            {chat.counterparty?.job_title && (
                              <p className={`text-sm truncate mb-3 ${hasUnread ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                                {chat.counterparty.job_title}
                              </p>
                            )}
                            
                            {/* Message count */}
                            {Number(chat.message_count) > 0 && (
                              <p className="text-xs text-muted-foreground">
                                {Number(chat.message_count)} message{Number(chat.message_count) !== 1 ? 's' : ''}
                              </p>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                      })
                    ) : (
                      <div className="text-center py-12 px-6">
                        <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Archive className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h4 className="font-semibold text-foreground mb-2">No past jobs yet</h4>
                        <p className="text-muted-foreground text-sm">
                          Completed jobs will appear here when you finish working with homeowners.
                        </p>
                      </div>
                    )
                  )}
                </>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;