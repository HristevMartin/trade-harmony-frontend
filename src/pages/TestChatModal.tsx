import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PaymentSuccessModal } from '@/components/chat-first';

const TestChatModal = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold">Test Chat Modal</h1>
        <p className="text-muted-foreground">
          Click the button below to test the PaymentSuccessModal
        </p>
        <Button 
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Open Chat Modal
        </Button>
      </div>

      <PaymentSuccessModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        jobId="test_job_123"
        homeowner={{
          id: "test_homeowner",
          name: "Test Homeowner"
        }}
        trader={{
          id: "test_trader", 
          name: "Test Trader"
        }}
      />
    </div>
  );
};

export default TestChatModal;
