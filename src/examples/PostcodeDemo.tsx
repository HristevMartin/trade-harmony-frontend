import React, { useState } from 'react';
import PostcodeInput from '../components/PostcodeInput';

const PostcodeDemo: React.FC = () => {
  const [postcode, setPostcode] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [submittedPostcode, setSubmittedPostcode] = useState('');

  const handlePostcodeChange = (value: string) => {
    setPostcode(value);
    setIsVerified(false);
  };

  const handlePostcodeValid = (value: string) => {
    console.log('Postcode verified:', value);
    setIsVerified(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isVerified && postcode) {
      setSubmittedPostcode(postcode);
      alert(`Form submitted with postcode: ${postcode}`);
    }
  };

  const handleReset = () => {
    setPostcode('');
    setIsVerified(false);
    setSubmittedPostcode('');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            UK Postcode Input Demo
          </h1>
          <p className="text-gray-600">
            Type a UK postcode to see autocomplete suggestions and verification
          </p>
        </div>

        {/* Main Demo Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <PostcodeInput
              label="Your Postcode"
              value={postcode}
              onChange={handlePostcodeChange}
              onValid={handlePostcodeValid}
              placeholder="e.g., SW1A 1AA"
              helperText="Start typing to see suggestions (try: SW1A, M1, B33)"
              required
              autoFocus
              showSuggestions
              maxSuggestions={8}
            />

            {/* Status indicators */}
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Current value:</span>
                <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">
                  {postcode || '(empty)'}
                </code>
              </div>

              {isVerified && (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Verified ✓
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={!isVerified || !postcode}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-150"
              >
                Continue
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2.5 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors duration-150"
              >
                Reset
              </button>
            </div>

            {submittedPostcode && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-900">
                  <strong>Form submitted!</strong> Postcode: {submittedPostcode}
                </p>
              </div>
            )}
          </form>
        </div>

        {/* Features List */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Features</h2>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span><strong>Autocomplete:</strong> Start typing 3+ characters to see suggestions from postcodes.io</span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span><strong>Format validation:</strong> Checks UK postcode format (e.g., SW1A 1AA)</span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span><strong>Existence verification:</strong> Checks if postcode exists via postcodes.io API</span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span><strong>Keyboard navigation:</strong> Arrow keys, Enter to select, Escape to close</span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span><strong>Accessible:</strong> Full ARIA support for screen readers</span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span><strong>Auto-formatting:</strong> Normalizes to uppercase with proper spacing</span>
            </li>
          </ul>
        </div>

        {/* Example Postcodes */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Try These Example Postcodes</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {['SW1A 1AA', 'M1 1AE', 'B33 8TH', 'CR2 6XH', 'DN55 1PT', 'W1A 0AX'].map((example) => (
              <button
                key={example}
                type="button"
                onClick={() => {
                  setPostcode(example);
                  setIsVerified(false);
                }}
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-mono rounded border border-gray-300 transition-colors duration-150"
              >
                {example}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-4">
            Click any example to populate the input field. Most of these are real postcodes (SW1A 1AA = Buckingham Palace!)
          </p>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>
            Powered by{' '}
            <a
              href="https://postcodes.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 underline"
            >
              postcodes.io
            </a>{' '}
            API
          </p>
        </div>
      </div>
    </div>
  );
};

export default PostcodeDemo;

