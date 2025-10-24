import React, { useState, useRef, useEffect, useId } from 'react';
import { isValidFormat, normalize, fetchSuggestions, verifyPostcodeExists } from '../utils/postcode';
import { useDebouncedValue } from '../hooks/useDebouncedValue';

// Detect Tailwind by checking if utility classes exist
const hasTailwind = (() => {
  try {
    const testEl = document.createElement('div');
    testEl.className = 'hidden';
    document.body.appendChild(testEl);
    const hasTw = window.getComputedStyle(testEl).display === 'none';
    document.body.removeChild(testEl);
    return hasTw;
  } catch {
    return false;
  }
})();

// Import CSS module only if Tailwind is not available
let styles: Record<string, string> = {};
if (!hasTailwind) {
  import('./PostcodeInput.module.css').then((module) => {
    styles = module.default || module;
  });
}

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
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      const exists = await verifyPostcodeExists(postcode);
      
      if (exists) {
        if (onValid) {
          onValid(normalize(postcode));
        }
      } else {
        setError('We couldn\'t verify this postcode.');
      }
    } catch (err) {
      // Non-blocking error
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
        return;
      }
      
      if (!isValidFormat(trimmed)) {
        setError('Please enter a valid UK postcode format (e.g., SW1A 1AA)');
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

  // Tailwind classes
  const twClasses = hasTailwind
    ? {
        wrapper: 'relative w-full',
        label: 'block text-sm font-medium text-gray-700 mb-2',
        required: 'text-red-500 ml-1',
        inputWrapper: 'relative',
        input: `w-full px-3 py-2.5 text-sm border rounded-lg transition-all duration-150 ${
          error
            ? 'border-red-400 bg-red-50 focus:border-red-500 focus:ring-4 focus:ring-red-100'
            : 'border-gray-300 bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
        } focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60`,
        spinner: 'absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin',
        suggestionsWrapper: 'absolute top-full left-0 right-0 mt-1 z-50',
        suggestions: 'max-h-64 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg p-1',
        suggestion: 'px-3 py-2.5 text-sm cursor-pointer rounded-md transition-colors duration-150',
        suggestionHover: 'hover:bg-gray-100',
        suggestionActive: 'bg-blue-50 text-blue-900',
        suggestionEmpty: 'px-3 py-3 text-sm text-gray-500 text-center',
        helperText: 'block mt-1.5 text-xs text-gray-600',
        errorText: 'block mt-1.5 text-xs text-red-600',
      }
    : styles;

  const isLoading = isLoadingSuggestions || isVerifying;

  return (
    <div ref={wrapperRef} className={hasTailwind ? twClasses.wrapper : styles.wrapper + ` ${className}`}>
      {label && (
        <label htmlFor={inputId} className={hasTailwind ? twClasses.label : styles.label}>
          {label}
          {required && (
            <span className={hasTailwind ? twClasses.required : styles.required} aria-label="required">
              *
            </span>
          )}
        </label>
      )}

      <div className={hasTailwind ? twClasses.inputWrapper : styles.inputWrapper}>
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
            activeIndex >= 0 && showDropdown
              ? `${listboxId}-option-${activeIndex}`
              : undefined
          }
          aria-invalid={!!error}
          aria-describedby={error ? errorId : helperId}
          className={
            hasTailwind
              ? `${twClasses.input} ${inputClassName}`
              : `${styles.input} ${error ? styles.error : ''} ${inputClassName}`
          }
        />

        {isLoading && (
          <div
            className={hasTailwind ? twClasses.spinner : styles.spinner}
            role="status"
            aria-label="Loading"
          />
        )}
      </div>

      {showDropdown && suggestions.length > 0 && (
        <div className={hasTailwind ? twClasses.suggestionsWrapper : styles.suggestionsWrapper}>
          <ul
            ref={suggestionsRef}
            id={listboxId}
            role="listbox"
            aria-label="Postcode suggestions"
            className={hasTailwind ? twClasses.suggestions : styles.suggestions}
          >
            {suggestions.map((suggestion, index) => (
              <li
                key={`${suggestion}-${index}`}
                id={`${listboxId}-option-${index}`}
                role="option"
                aria-selected={index === activeIndex}
                onClick={() => selectSuggestion(suggestion)}
                onMouseEnter={() => setActiveIndex(index)}
                className={
                  hasTailwind
                    ? `${twClasses.suggestion} ${
                        index === activeIndex ? twClasses.suggestionActive : twClasses.suggestionHover
                      }`
                    : `${styles.suggestion} ${index === activeIndex ? styles.active : ''}`
                }
              >
                {suggestion}
              </li>
            ))}
          </ul>
        </div>
      )}

      {showDropdown && !isLoadingSuggestions && suggestions.length === 0 && inputValue.length >= 3 && (
        <div className={hasTailwind ? twClasses.suggestionsWrapper : styles.suggestionsWrapper}>
          <div className={hasTailwind ? twClasses.suggestions : styles.suggestions}>
            <div className={hasTailwind ? twClasses.suggestionEmpty : styles.suggestionEmpty}>
              No postcodes found
            </div>
          </div>
        </div>
      )}

      {error ? (
        <span id={errorId} className={hasTailwind ? twClasses.errorText : styles.errorText} role="alert">
          {error}
        </span>
      ) : helperText && !isLoading ? (
        <span id={helperId} className={hasTailwind ? twClasses.helperText : styles.helperText}>
          {helperText}
        </span>
      ) : null}
    </div>
  );
};

export default PostcodeInput;
export { isValidFormat, normalize };

