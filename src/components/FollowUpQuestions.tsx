import { Button } from '@/components/ui/button';
import { 
  HiLockClosed, 
  HiChatBubbleLeftRight,
  HiPaperAirplane 
} from 'react-icons/hi2';

interface FollowUpQuestionsProps {
  questions: string[];
  mode: 'prepay' | 'postpay';
  onQuestionClick: (question: string) => void;
  className?: string;
}

const FollowUpQuestions = ({ 
  questions, 
  mode, 
  onQuestionClick, 
  className = '' 
}: FollowUpQuestionsProps) => {
  // Don't render if no questions
  if (!questions || questions.length === 0) {
    return null;
  }

  const isPrepay = mode === 'prepay';

  const handleQuestionClick = (question: string) => {
    onQuestionClick(question);
  };

  const handleKeyDown = (event: React.KeyboardEvent, question: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleQuestionClick(question);
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-2">
        {isPrepay ? (
          <>
            <HiLockClosed className="w-4 h-4 text-slate-400" aria-hidden="true" />
            <h3 className="text-sm font-semibold text-slate-700">Smart Questions</h3>
          </>
        ) : (
          <>
            <HiChatBubbleLeftRight className="w-4 h-4 text-blue-600" aria-hidden="true" />
            <h3 className="text-sm font-semibold text-slate-800">Quick replies (tap to ask)</h3>
          </>
        )}
      </div>

      {/* Questions Grid */}
      <div className="flex flex-wrap gap-2">
        {questions.map((question, index) => (
          <button
            key={index}
            onClick={() => handleQuestionClick(question)}
            onKeyDown={(e) => handleKeyDown(e, question)}
            disabled={isPrepay}
            className={`
              inline-flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-offset-2
              ${isPrepay 
                ? `
                  bg-slate-100 text-slate-500 border border-slate-200 cursor-pointer
                  hover:bg-slate-150 hover:border-slate-300 hover:text-slate-600
                  focus:ring-slate-400
                ` 
                : `
                  bg-blue-50 text-blue-700 border border-blue-200 cursor-pointer
                  hover:bg-blue-100 hover:border-blue-300 hover:text-blue-800 hover:shadow-sm
                  active:bg-blue-200 active:scale-95
                  focus:ring-blue-400
                `
              }
            `}
            title={isPrepay ? 'Apply for the job to unlock this question' : 'Click to send this message'}
            aria-label={isPrepay ? `Locked question: ${question}` : `Send message: ${question}`}
            tabIndex={0}
          >
            <span className="text-left leading-tight max-w-[200px] sm:max-w-none">
              {question}
            </span>
            {isPrepay ? (
              <HiLockClosed className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
            ) : (
              <HiPaperAirplane className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
            )}
          </button>
        ))}
      </div>

      {/* Helper Text */}
      {isPrepay && (
        <p className="text-xs text-slate-500 leading-relaxed">
          Unlock these smart questions by applying for the job.
        </p>
      )}
    </div>
  );
};

export default FollowUpQuestions;
