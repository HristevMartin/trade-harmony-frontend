import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { HiXMark, HiPaperAirplane, HiChatBubbleLeftRight, HiArrowPath, HiMapPin, HiCheckBadge, HiStar, HiEnvelope } from 'react-icons/hi2';

interface TraderSuggestion {
    traderId: string;
    name: string;
    email: string;
    trade: string;
    city: string;
    postcode: string;
    distanceKm: number;
    experienceYears: number;
    verified: boolean;
    badges: string[];
    image?: string;
}

interface Message {
    id: string;
    role: 'user' | 'assistant';
    text: string;
    createdAt: string;
    suggestions?: TraderSuggestion[];
    nextAction?: string;
}

interface JobAssistantMiniChatProps {
    jobId: string;
    title: string;
    postcode: string;
    serviceCategory?: string;
}

interface QuickAction {
    id: string;
    icon: string;
    label: string;
    message: string | null; // null means just focus input
}

export default function JobAssistantMiniChat({ jobId, title, postcode, serviceCategory }: JobAssistantMiniChatProps) {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Initialize with seed message
    useEffect(() => {
        const storageKey = `chat-${jobId}`;
        const stored = localStorage.getItem(storageKey);
        
        if (stored) {
            try {
                setMessages(JSON.parse(stored));
            } catch (e) {
                console.error('Failed to parse stored messages', e);
                initializeSeedMessage();
            }
        } else {
            initializeSeedMessage();
        }
    }, [jobId]);

    const initializeSeedMessage = () => {
        const seedMessage: Message = {
            id: crypto.randomUUID(),
            role: 'assistant',
            text: `Hi, I'm the JOB Hub AI Agent. Your job '${title}' in ${postcode} is live. How can I help you today?`,
            createdAt: new Date().toISOString(),
        };
        setMessages([seedMessage]);
        localStorage.setItem(`chat-${jobId}`, JSON.stringify([seedMessage]));
    };

    // Format trade category to plural form
    const formatTradeName = (trade: string): string => {
        const tradeMap: { [key: string]: string } = {
            'Electrical': 'Electricians',
            'Plumbing': 'Plumbers',
            'Carpentry': 'Carpenters',
            'Painting': 'Painters',
            'Roofing': 'Roofers',
            'Heating': 'Heating Engineers',
            'Landscaping': 'Landscapers',
            'Building': 'Builders',
            'Tiling': 'Tilers',
            'Plastering': 'Plasterers',
            'Flooring': 'Flooring Specialists',
            'Kitchen': 'Kitchen Fitters',
            'Bathroom': 'Bathroom Fitters',
            'Decorating': 'Decorators',
            'Glazing': 'Glaziers',
            'Fencing': 'Fencing Contractors',
            'Paving': 'Paving Contractors',
        };
        
        return tradeMap[trade] || trade;
    };

    // Generate dynamic quick actions based on service category
    const formattedCategory = serviceCategory ? formatTradeName(serviceCategory) : 'Professionals';
    const quickActions: QuickAction[] = [
        {
            id: 'find-trade',
            icon: '🔍',
            label: `Find ${formattedCategory}`,
            message: `Show me ${formattedCategory.toLowerCase()} near me`
        },
        {
            id: 'change-trade',
            icon: '🔄',
            label: 'Find a different trader',
            message: null // null means just focus input
        }
    ];

    const handleQuickAction = async (action: QuickAction) => {
        if (isLoading) return;

        // If action has no message (e.g., "Ask a Question"), just focus input
        if (!action.message) {
            inputRef.current?.focus();
            return;
        }

        // Add user message
        const userMessage: Message = {
            id: crypto.randomUUID(),
            role: 'user',
            text: action.message,
            createdAt: new Date().toISOString(),
        };

        const updatedMessages = [...messages, userMessage];
        setMessages(updatedMessages);
        localStorage.setItem(`chat-${jobId}`, JSON.stringify(updatedMessages));
        setIsLoading(true);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/travel/ai/homeowner-chat`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: action.message,
                    jobId: jobId,
                    jobTitle: title,
                    location: postcode
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to get response');
            }

            const data = await response.json();
            
            // Add assistant response
            const assistantMessage: Message = {
                id: crypto.randomUUID(),
                role: 'assistant',
                text: data.reply || data.response || data.message || 'Sorry, I could not process that request.',
                createdAt: new Date().toISOString(),
                suggestions: data.suggestions || [],
                nextAction: data.nextAction,
            };

            const finalMessages = [...updatedMessages, assistantMessage];
            setMessages(finalMessages);
            localStorage.setItem(`chat-${jobId}`, JSON.stringify(finalMessages));
        } catch (error) {
            console.error('Error sending message:', error);
            
            // Add error message
            const errorMessage: Message = {
                id: crypto.randomUUID(),
                role: 'assistant',
                text: 'Sorry, I encountered an error. Please try again.',
                createdAt: new Date().toISOString(),
            };

            const finalMessages = [...updatedMessages, errorMessage];
            setMessages(finalMessages);
            localStorage.setItem(`chat-${jobId}`, JSON.stringify(finalMessages));
        } finally {
            setIsLoading(false);
        }
    };

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Focus input when chat opens
    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus();
        }
    }, [isOpen]);

    const handleSend = async () => {
        const trimmedInput = inputValue.trim();
        if (!trimmedInput || isLoading) return;

        // Add user message
        const userMessage: Message = {
            id: crypto.randomUUID(),
            role: 'user',
            text: trimmedInput,
            createdAt: new Date().toISOString(),
        };

        const updatedMessages = [...messages, userMessage];
        setMessages(updatedMessages);
        localStorage.setItem(`chat-${jobId}`, JSON.stringify(updatedMessages));
        setInputValue('');
        setIsLoading(true);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/travel/ai/homeowner-chat`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: trimmedInput,
                    jobId: jobId,
                    jobTitle: title,
                    location: postcode
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to get response');
            }

            const data = await response.json();
            
            // Add assistant response
            const assistantMessage: Message = {
                id: crypto.randomUUID(),
                role: 'assistant',
                text: data.reply || data.response || data.message || 'Sorry, I could not process that request.',
                createdAt: new Date().toISOString(),
                suggestions: data.suggestions || [],
                nextAction: data.nextAction,
            };

            const finalMessages = [...updatedMessages, assistantMessage];
            setMessages(finalMessages);
            localStorage.setItem(`chat-${jobId}`, JSON.stringify(finalMessages));
        } catch (error) {
            console.error('Error sending message:', error);
            
            // Add error message
            const errorMessage: Message = {
                id: crypto.randomUUID(),
                role: 'assistant',
                text: 'Sorry, I encountered an error. Please try again.',
                createdAt: new Date().toISOString(),
            };

            const finalMessages = [...updatedMessages, errorMessage];
            setMessages(finalMessages);
            localStorage.setItem(`chat-${jobId}`, JSON.stringify(finalMessages));
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleClearChat = () => {
        initializeSeedMessage();
        setInputValue('');
    };

    const handleTraderClick = (traderId: string) => {
        navigate(`/tradesperson-profile/${traderId}`);
    };

    const handleNotifyTrader = async (trader: TraderSuggestion) => {
        console.log('=============================================');
        console.log('Notifying trader by email...');
        console.log('=============================================');

        try {
            // Get homeowner information from localStorage
            const authUser = localStorage.getItem('auth_user');
            let homeownerInfo = null;
            if (authUser) {
                try {
                    homeownerInfo = JSON.parse(authUser);
                } catch (err) {
                    console.error('Error parsing auth user:', err);
                }
            }

            const payload = {
                // Trader Information
                trader: {
                    traderId: trader.traderId,
                    name: trader.name,
                    email: trader.email,
                    trade: trader.trade,
                    city: trader.city,
                    postcode: trader.postcode,
                    distanceKm: trader.distanceKm,
                    experienceYears: trader.experienceYears,
                    verified: trader.verified,
                    badges: trader.badges
                },
                // Job Information
                job: {
                    jobId: jobId,
                    title: title,
                    location: postcode,
                    serviceCategory: serviceCategory || 'N/A'
                },
                // Homeowner Information
                homeowner: homeownerInfo ? {
                    id: homeownerInfo.id,
                    name: homeownerInfo.name || homeownerInfo.first_name || 'Homeowner',
                    email: homeownerInfo.email
                } : null
            };

            console.log('Payload being sent:', JSON.stringify(payload, null, 2));

            const response = await fetch(`${import.meta.env.VITE_API_URL}/travel/ai/notify-trader-by-email-from-chat`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`API call failed with status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Success! Response:', data);
            console.log('=============================================');
            
            // Show success feedback to user
            toast.success(`Notification sent to ${trader.name}!`, {
                description: `Email successfully sent to ${trader.trade} trader.`,
                duration: 4000,
            });
        } catch (error) {
            console.error('Error notifying trader:', error);
            console.log('=============================================');
            
            // Show error feedback to user
            toast.error(`Failed to notify ${trader.name}`, {
                description: 'Please try again or contact support.',
                duration: 4000,
            });
        }
    };

    const renderMessage = (msg: Message) => {
        // Extract plain text without markdown formatting for display
        const plainText = msg.text
            .replace(/!\[.*?\]\(.*?\)/g, '') // Remove markdown images
            .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold formatting
            .split('\n\n')[0] // Take only first paragraph (before trader list)
            .trim();

        return (
            <div key={msg.id} className="space-y-3">
                {/* Main message text */}
                <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                            msg.role === 'user'
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-100 text-slate-900'
                        }`}
                    >
                        <p className="text-sm leading-relaxed">{plainText || msg.text}</p>
                        <span className="text-xs opacity-60 mt-1 block">just now</span>
                    </div>
                </div>

                {/* Trader suggestion cards */}
                {msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="space-y-2 pl-2">
                        <p className="text-xs font-medium text-slate-600 px-2">Suggested Traders:</p>
                        {msg.suggestions.map((trader) => (
                            <Card
                                key={trader.traderId}
                                className="p-3 hover:shadow-md transition-shadow cursor-pointer border border-slate-200 hover:border-blue-300"
                                onClick={() => handleTraderClick(trader.traderId)}
                            >
                                <div className="flex gap-3">
                                    {/* Trader avatar */}
                                    <div className="flex-shrink-0">
                                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-lg border-2 border-slate-200">
                                            {trader.name.charAt(0).toUpperCase()}
                                        </div>
                                    </div>

                                    {/* Trader info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2 mb-1">
                                            <div className="flex items-center gap-1.5">
                                                <h4 className="font-semibold text-slate-900 text-sm truncate">{trader.name}</h4>
                                                {trader.verified && (
                                                    <HiCheckBadge className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                                )}
                                            </div>
                                        </div>

                                        {/* Trade and experience */}
                                        <p className="text-xs text-slate-600 mb-2">
                                            {formatTradeName(trader.trade)} • {trader.experienceYears} years exp
                                        </p>

                                        {/* Location */}
                                        <div className="flex items-center gap-1 text-xs text-slate-500 mb-2">
                                            <HiMapPin className="w-3 h-3" />
                                            <span>{trader.city}, {trader.postcode}</span>
                                            {trader.distanceKm !== undefined && (
                                                <span className="text-slate-400">• {trader.distanceKm === 0 ? 'Same area' : `${trader.distanceKm.toFixed(1)}km away`}</span>
                                            )}
                                        </div>

                                        {/* Badges */}
                                        {trader.badges && trader.badges.length > 0 && (
                                            <div className="flex flex-wrap gap-1">
                                                {trader.badges.map((badge, idx) => (
                                                    <Badge
                                                        key={idx}
                                                        variant="secondary"
                                                        className="text-xs px-2 py-0 h-5 bg-blue-50 text-blue-700 border-blue-200"
                                                    >
                                                        {badge}
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Notify via email CTA */}
                                <div className="mt-2 pt-2 border-t border-slate-100">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="w-full text-xs h-7 text-blue-600 hover:text-blue-700 hover:bg-blue-50 flex items-center justify-center gap-1.5"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleNotifyTrader(trader);
                                        }}
                                    >
                                        <HiEnvelope className="w-3.5 h-3.5" />
                                        Notify via Email
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    if (!isOpen) {
        return (
            <div className="fixed bottom-6 right-6 z-50">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            onClick={() => setIsOpen(true)}
                            className="relative rounded-full w-14 h-14 shadow-lg bg-blue-600 hover:bg-blue-700 text-white p-0"
                            aria-label="Open AI job assistant chat"
                        >
                            <HiChatBubbleLeftRight className="w-6 h-6" />
                            {/* AI Badge */}
                            <span className="absolute -top-1 -right-1 bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-md">
                                AI
                            </span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left" className="bg-slate-900 text-white">
                        <p className="font-medium">AI Job Assistant</p>
                        <p className="text-xs text-slate-300">Get instant help finding traders</p>
                    </TooltipContent>
                </Tooltip>
            </div>
        );
    }

    return (
        <>
            {/* Mobile: Bottom Sheet */}
            <div className="md:hidden fixed inset-x-0 bottom-0 z-50 animate-slide-up">
                <Card className="rounded-t-3xl border-t border-slate-200 shadow-2xl bg-white h-[70vh] flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-slate-200">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <HiChatBubbleLeftRight className="w-4 h-4 text-blue-600" />
                            </div>
                            <h3 className="font-semibold text-slate-900">Job Assistant</h3>
                        </div>
                        <div className="flex items-center gap-2">
                            {messages.length > 1 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleClearChat}
                                    className="h-8 w-8 p-0 text-slate-600 hover:text-blue-600"
                                    aria-label="Clear chat"
                                    title="Start over"
                                >
                                    <HiArrowPath className="w-4 h-4" />
                                </Button>
                            )}
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsOpen(false)}
                                className="h-8 w-8 p-0"
                                aria-label="Close chat"
                            >
                                <HiXMark className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3" role="log" aria-live="polite">
                        {messages.map((msg) => renderMessage(msg))}
                        
                        {/* Quick Action Chips - Show only if first message */}
                        {messages.length === 1 && !isLoading && (
                            <div className="px-2 pb-3">
                                <p className="text-xs text-slate-500 mb-2 px-2">Quick actions:</p>
                                <div className="flex flex-col gap-2">
                                    {quickActions.map((action) => (
                                        <button
                                            key={action.id}
                                            onClick={() => handleQuickAction(action)}
                                            className="flex items-center gap-2 px-4 py-3 min-h-[44px] text-sm font-medium bg-white border border-slate-300 text-slate-700 rounded-xl hover:bg-blue-50 hover:border-blue-400 hover:text-blue-600 hover:shadow-sm transition-all disabled:opacity-50 text-left"
                                            disabled={isLoading}
                                        >
                                            <span className="text-lg flex-shrink-0">{action.icon}</span>
                                            <span className="flex-1">{action.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {/* Loading indicator */}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-slate-100 rounded-2xl px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <div className="flex gap-1">
                                            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                        </div>
                                        <span className="text-xs text-slate-600">Thinking...</span>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-4 border-t border-slate-200 bg-white">
                        <div className="flex gap-2">
                            <input
                                ref={inputRef}
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Type a message…"
                                className="flex-1 px-4 py-2 border border-slate-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                aria-label="Message"
                                disabled={isLoading}
                            />
                            <Button
                                onClick={handleSend}
                                disabled={!inputValue.trim() || isLoading}
                                className="rounded-full w-10 h-10 p-0 bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                                aria-label="Send message"
                            >
                                <HiPaperAirplane className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Desktop: Right Drawer */}
            <div className="hidden md:block fixed right-6 bottom-6 z-50 w-96 animate-slide-up">
                <Card className="rounded-2xl border border-slate-200 shadow-2xl bg-white h-[600px] flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-slate-200">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <HiChatBubbleLeftRight className="w-4 h-4 text-blue-600" />
                            </div>
                            <h3 className="font-semibold text-slate-900">Job Assistant</h3>
                        </div>
                        <div className="flex items-center gap-2">
                            {messages.length > 1 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleClearChat}
                                    className="h-8 w-8 p-0 text-slate-600 hover:text-blue-600"
                                    aria-label="Clear chat"
                                    title="Start over"
                                >
                                    <HiArrowPath className="w-4 h-4" />
                                </Button>
                            )}
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsOpen(false)}
                                className="h-8 w-8 p-0"
                                aria-label="Close chat"
                            >
                                <HiXMark className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3" role="log" aria-live="polite">
                        {messages.map((msg) => renderMessage(msg))}
                        
                        {/* Quick Action Chips - Show only if first message */}
                        {messages.length === 1 && !isLoading && (
                            <div className="px-2 pb-3">
                                <p className="text-xs text-slate-500 mb-2 px-2">Quick actions:</p>
                                <div className="flex flex-col gap-2">
                                    {quickActions.map((action) => (
                                        <button
                                            key={action.id}
                                            onClick={() => handleQuickAction(action)}
                                            className="flex items-center gap-2 px-4 py-3 min-h-[44px] text-sm font-medium bg-white border border-slate-300 text-slate-700 rounded-xl hover:bg-blue-50 hover:border-blue-400 hover:text-blue-600 hover:shadow-sm transition-all disabled:opacity-50 text-left"
                                            disabled={isLoading}
                                        >
                                            <span className="text-lg flex-shrink-0">{action.icon}</span>
                                            <span className="flex-1">{action.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {/* Loading indicator */}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-slate-100 rounded-2xl px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <div className="flex gap-1">
                                            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                        </div>
                                        <span className="text-xs text-slate-600">Thinking...</span>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-4 border-t border-slate-200 bg-white">
                        <div className="flex gap-2">
                            <input
                                ref={inputRef}
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Type a message…"
                                className="flex-1 px-4 py-2 border border-slate-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                aria-label="Message"
                                disabled={isLoading}
                            />
                            <Button
                                onClick={handleSend}
                                disabled={!inputValue.trim() || isLoading}
                                className="rounded-full w-10 h-10 p-0 bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                                aria-label="Send message"
                            >
                                <HiPaperAirplane className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>
        </>
    );
}
