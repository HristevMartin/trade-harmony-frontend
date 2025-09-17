import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PaymentSuccessModal, ChatProvider } from '@/components/chat-first';

const ChatDemo = () => {
    const [showModal, setShowModal] = useState(false);
    const [demoScenario, setDemoScenario] = useState<'new' | 'existing'>('new');

    const mockData = {
        jobId: 'job_demo_123',
        homeowner: {
            id: 'homeowner_demo_456',
            name: 'Emma Wilson'
        },
        trader: {
            id: 'trader_demo_789',
            name: 'David Smith'
        }
    };

    const openModal = (scenario: 'new' | 'existing') => {
        setDemoScenario(scenario);
        setShowModal(true);
    };

    return (
        <ChatProvider>
            <div className="min-h-screen bg-background p-8">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold mb-4">Chat-First Payment Success Demo</h1>
                        <p className="text-muted-foreground text-lg">
                            Experience the new post-payment chat flow
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 mb-8">
                        <Card className="p-6">
                            <h2 className="text-xl font-semibold mb-3">New Conversation</h2>
                            <p className="text-muted-foreground mb-4">
                                Simulate a first-time payment success where no conversation exists yet.
                            </p>
                            <ul className="text-sm text-muted-foreground mb-4 space-y-1">
                                <li>• Shows success screen first</li>
                                <li>• Leads to chat intro</li>
                                <li>• Creates new conversation</li>
                            </ul>
                            <Button onClick={() => openModal('new')} className="w-full">
                                Demo New Chat Flow
                            </Button>
                        </Card>

                        <Card className="p-6">
                            <h2 className="text-xl font-semibold mb-3">Existing Conversation</h2>
                            <p className="text-muted-foreground mb-4">
                                Simulate returning to an existing conversation after payment.
                            </p>
                            <ul className="text-sm text-muted-foreground mb-4 space-y-1">
                                <li>• Skips success screen</li>
                                <li>• Goes directly to chat intro</li>
                                <li>• Reuses existing conversation</li>
                            </ul>
                            <Button onClick={() => openModal('existing')} variant="outline" className="w-full">
                                Demo Existing Chat Flow
                            </Button>
                        </Card>
                    </div>

                    <Card className="p-6">
                        <h3 className="text-lg font-semibold mb-3">Features Demonstrated</h3>
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <h4 className="font-medium mb-2">UI/UX Features:</h4>
                                <ul className="space-y-1 text-muted-foreground">
                                    <li>• Chat-first approach (no contact details shown)</li>
                                    <li>• Three-stage modal flow</li>
                                    <li>• Template message prefilling</li>
                                    <li>• Real-time message updates</li>
                                    <li>• Attachment support</li>
                                    <li>• Mobile-responsive design</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-medium mb-2">Technical Features:</h4>
                                <ul className="space-y-1 text-muted-foreground">
                                    <li>• Context + Reducer state management</li>
                                    <li>• Mock store with fake latency</li>
                                    <li>• Focus trap and keyboard navigation</li>
                                    <li>• Accessibility features (ARIA, screen readers)</li>
                                    <li>• Error handling with retry</li>
                                    <li>• Pending message states</li>
                                </ul>
                            </div>
                        </div>
                    </Card>

                    <PaymentSuccessModal
                        isOpen={showModal}
                        onClose={() => setShowModal(false)}
                        jobId={mockData.jobId}
                        homeowner={mockData.homeowner}
                        trader={mockData.trader}
                        existingConversationId={demoScenario === 'existing' ? 'conv_existing_123' : undefined}
                    />
                </div>
            </div>
        </ChatProvider>
    );
};

export default ChatDemo;
