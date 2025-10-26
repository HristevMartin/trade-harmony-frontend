import React, { useState, useRef, useEffect, useId } from 'react';
import { isValidFormat, normalize, fetchSuggestions, verifyPostcodeExists } from '../utils/postcode';
import { useDebouncedValue } from '../hooks/useDebouncedValue';

export type PostcodeInputProps = {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onValid?: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
  showSuggestions?: boolean;
  maxSuggestions?: number;
  className?: string;
  inputClassName?: string;
  helperText?: string;
};

const PostcodeInput: React.FC<PostcodeInputProps> = ({
  label = 'Postcode',
  placeholder = 'e.g., SW1A 1AA',
  value: controlledValue = '',
  onChange,
  onValid,
  required = true,
  disabled = false,
  autoFocus = false,
  showSuggestions = true,
  maxSuggestions = 8,
  className = '',
  inputClassName = '',
  helperText = 'We\'ll verify this postcode exists',
}) => {
  const [inputValue, setInputValue] = useState(controlledValue);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string>('');
  const [isFocused, setIsFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLUListElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const inputId = useId();
  const errorId = useId();
  const helperId = useId();
  const listboxId = useId();

  const debouncedInputValue = useDebouncedValue(inputValue, 280);

  // Sync with controlled value
  useEffect(() => {
    setInputValue(controlledValue);
  }, [controlledValue]);

  // Fetch suggestions when debounced value changes
  useEffect(() => {
    if (!showSuggestions || !isFocused) return;
    if (debouncedInputValue.length < 3) {
      setSuggestions([]);
      return;
    }

    const fetchData = async () => {
      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();
      setIsLoadingSuggestions(true);

      try {
        const results = await fetchSuggestions(
          debouncedInputValue,
          abortControllerRef.current.signal
        );
        setSuggestions(results.slice(0, maxSuggestions));
        setShowDropdown(results.length > 0);
      } catch (err) {
        // Silently handle errors
        setSuggestions([]);
      } finally {
        setIsLoadingSuggestions(false);
      }
    };

    fetchData();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [debouncedInputValue, isFocused, showSuggestions, maxSuggestions]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
        setActiveIndex(-1);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showDropdown]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const normalized = rawValue.toUpperCase().replace(/\s+/g, ' ').trim();
    
    setInputValue(rawValue);
    setError('');
    setIsVerified(false);
    setActiveIndex(-1);
    
    if (onChange) {
      onChange(normalized);
    }
  };

  const selectSuggestion = async (postcode: string) => {
    const normalized = normalize(postcode);
    setInputValue(normalized);
    setShowDropdown(false);
    setActiveIndex(-1);
    setSuggestions([]);
    
    if (onChange) {
      onChange(normalized);
    }
    
    // Verify the selected postcode
    await verifyPostcode(normalized);
  };

  const verifyPostcode = async (postcode: string) => {
    if (!postcode || !isValidFormat(postcode)) {
      setIsVerified(false);
      return;
    }

    setIsVerifying(true);
    setError('');
    setIsVerified(false);

    try {
      const exists = await verifyPostcodeExists(postcode);
      
      if (exists) {
        setIsVerified(true);
        if (onValid) {
          onValid(normalize(postcode));
        }
      } else {
        setIsVerified(false);
        setError('We couldn\'t verify this postcode.');
      }
    } catch (err) {
      // Non-blocking error
      setIsVerified(false);
      console.warn('Verification failed:', err);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleBlur = async () => {
    // Small delay to allow click events on suggestions
    setTimeout(async () => {
      setIsFocused(false);
      setShowDropdown(false);
      
      const trimmed = inputValue.trim();
      
      if (!trimmed) {
        setError('');
        setIsVerified(false);
        return;
      }
      
      if (!isValidFormat(trimmed)) {
        setError('Please enter a valid UK postcode format (e.g., SW1A 1AA)');
        setIsVerified(false);
        return;
      }
      
      // Normalize and verify
      const normalized = normalize(trimmed);
      setInputValue(normalized);
      
      if (onChange) {
        onChange(normalized);
      }
      
      await verifyPostcode(normalized);
    }, 150);
  };

  const handleFocus = () => {
    setIsFocused(true);
    if (suggestions.length > 0 && inputValue.length >= 3) {
      setShowDropdown(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown || suggestions.length === 0) {
      if (e.key === 'Escape') {
        setShowDropdown(false);
        setActiveIndex(-1);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex((prev) => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((prev) => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      
      case 'Enter':
        e.preventDefault();
        if (activeIndex >= 0 && activeIndex < suggestions.length) {
          selectSuggestion(suggestions[activeIndex]);
        }
        break;
      
      case 'Escape':
        e.preventDefault();
        setShowDropdown(false);
        setActiveIndex(-1);
        break;
    }
  };

  // Scroll active item into view
  useEffect(() => {
    if (activeIndex >= 0 && suggestionsRef.current) {
      const activeElement = suggestionsRef.current.children[activeIndex] as HTMLElement;
      if (activeElement) {
        activeElement.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth',
        });
      }
    }
  }, [activeIndex]);

  const isLoading = isLoadingSuggestions || isVerifying;

  return (
    <div ref={wrapperRef} className={`relative w-full ${className}`}>
      {label && (
        <label htmlFor={inputId} className="block text-base font-medium text-slate-900 mb-3">
          {label}
          {required && <span className="text-red-500 ml-1" aria-label="required"> *</span>}
        </label>
      )}

      <div className="relative">
        <input
          ref={inputRef}
          id={inputId}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          autoFocus={autoFocus}
          autoComplete="postal-code"
          required={required}
          role="combobox"
          aria-autocomplete="list"
          aria-controls={listboxId}
          aria-expanded={showDropdown}
          aria-activedescendant={
            activeIndex >= 0 && showDropdown ? `${listboxId}-option-${activeIndex}` : undefined
          }
          aria-invalid={!!error}
          aria-describedby={error ? errorId : helperId}
          className={`w-full bg-white focus:outline-none disabled:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 placeholder:text-slate-400 ${
            inputClassName || 'h-12 text-base px-4 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
          } ${
            error ? 'border-red-500 bg-red-50' : ''
          }`}
        />

        {isLoading && (
          <div
            className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-slate-200 border-t-blue-500 rounded-full animate-spin"
            role="status"
            aria-label="Loading"
          />
        )}
      </div>

      {showDropdown && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50">
          <ul
            ref={suggestionsRef}
            id={listboxId}
            role="listbox"
            aria-label="Postcode suggestions"
            className="max-h-72 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-xl py-2"
          >
            {suggestions.map((suggestion, index) => (
              <li
                key={`${suggestion}-${index}`}
                id={`${listboxId}-option-${index}`}
                role="option"
                aria-selected={index === activeIndex}
                onClick={() => selectSuggestion(suggestion)}
                onMouseEnter={() => setActiveIndex(index)}
                className={`px-4 py-3 text-sm cursor-pointer transition-all flex items-center justify-between ${
                  index === activeIndex
                    ? 'bg-blue-50 text-blue-900 font-medium'
                    : 'hover:bg-blue-50'
                }`}
              >
                <span className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-slate-400"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  {suggestion}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {showDropdown && !isLoadingSuggestions && suggestions.length === 0 && inputValue.length >= 3 && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50">
          <div className="bg-white border border-slate-200 rounded-xl shadow-xl py-2">
            <div className="px-4 py-4 text-sm text-slate-500 text-center">No postcodes found</div>
          </div>
        </div>
      )}

      {error && (
        <span id={errorId} className="block mt-1.5 text-xs text-red-600" role="alert">
          {error}
        </span>
      )}
      
      {!error && helperText && (
        <span id={helperId} className="block mt-1.5 text-xs text-slate-500">
          {helperText}
        </span>
      )}
    </div>
  );
};

export default PostcodeInput;
export { isValidFormat, normalize };

