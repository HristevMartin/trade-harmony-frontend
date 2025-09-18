import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PaymentSuccessModal } from '@/components/chat-first';

const PaymentResult = () => {
    const [searchParams] = useSearchParams();
    const [showModal, setShowModal] = useState(false);
    
    // Mock data - in real app this would come from URL params or API
    const mockData = {
        jobId: searchParams.get('job_id') || 'job_123',
        homeowner: {
            id: 'homeowner_456',
            name: searchParams.get('homeowner_name') || 'Sarah Johnson'
        },
        trader: {
            id: 'trader_789',
            name: 'Mike Thompson'
        },
        existingConversationId: searchParams.get('conversation_id') || undefined
    };

    useEffect(() => {
        // Show modal automatically when payment is successful
        const paymentStatus = searchParams.get('payment_status');
        if (paymentStatus === 'success') {
            setShowModal(true);
        }
    }, [searchParams]);

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="text-center">
                <h1 className="text-2xl font-bold mb-4">Payment Processing</h1>
                <p className="text-muted-foreground">
                    {showModal ? 'Payment successful!' : 'Processing your payment...'}
                </p>
            </div>

            <PaymentSuccessModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                jobId={mockData.jobId}
                homeowner={mockData.homeowner}
                trader={mockData.trader}
                existingConversationId={mockData.existingConversationId}
            />
        </div>
    );
};

export default PaymentResult;
