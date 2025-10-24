import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PostcodeInput, { isValidFormat, normalize } from '../PostcodeInput';

// Mock fetch globally
global.fetch = vi.fn();

describe('Postcode Utilities', () => {
  describe('isValidFormat', () => {
    it('validates correct UK postcode formats', () => {
      expect(isValidFormat('SW1A 1AA')).toBe(true);
      expect(isValidFormat('M1 1AE')).toBe(true);
      expect(isValidFormat('B33 8TH')).toBe(true);
      expect(isValidFormat('CR2 6XH')).toBe(true);
      expect(isValidFormat('DN55 1PT')).toBe(true);
      expect(isValidFormat('SW1A1AA')).toBe(true); // Without space
    });

    it('rejects invalid postcode formats', () => {
      expect(isValidFormat('INVALID')).toBe(false);
      expect(isValidFormat('123456')).toBe(false);
      expect(isValidFormat('A1 1A')).toBe(false); // Too short
      expect(isValidFormat('')).toBe(false);
      expect(isValidFormat('SW1A 1AAA')).toBe(false); // Too long
    });

    it('handles edge cases', () => {
      expect(isValidFormat(null as any)).toBe(false);
      expect(isValidFormat(undefined as any)).toBe(false);
      expect(isValidFormat(123 as any)).toBe(false);
    });
  });

  describe('normalize', () => {
    it('normalizes postcodes to uppercase with single space', () => {
      expect(normalize('sw1a1aa')).toBe('SW1A 1AA');
      expect(normalize('m1   1ae')).toBe('M1 1AE');
      expect(normalize(' b33 8th ')).toBe('B33 8TH');
      expect(normalize('SW1A1AA')).toBe('SW1A 1AA');
    });

    it('handles short postcodes', () => {
      expect(normalize('M1')).toBe('M1');
      expect(normalize('SW1')).toBe('SW1');
    });

    it('handles empty input', () => {
      expect(normalize('')).toBe('');
      expect(normalize('   ')).toBe('');
    });
  });
});

describe('PostcodeInput Component', () => {
  const mockOnChange = vi.fn();
  const mockOnValid = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any).mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders with default props', () => {
    render(<PostcodeInput />);
    
    expect(screen.getByLabelText(/postcode/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/e.g., SW1A 1AA/i)).toBeInTheDocument();
  });

  it('renders with custom label and placeholder', () => {
    render(
      <PostcodeInput
        label="Enter Your Postcode"
        placeholder="Type postcode here"
      />
    );
    
    expect(screen.getByLabelText(/enter your postcode/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/type postcode here/i)).toBeInTheDocument();
  });

  it('shows required indicator when required=true', () => {
    render(<PostcodeInput required />);
    
    const requiredIndicator = screen.getByText('*');
    expect(requiredIndicator).toBeInTheDocument();
  });

  it('handles controlled input value', () => {
    const { rerender } = render(
      <PostcodeInput value="SW1A 1AA" onChange={mockOnChange} />
    );
    
    const input = screen.getByRole('combobox');
    expect(input).toHaveValue('SW1A 1AA');
    
    // Update controlled value
    rerender(<PostcodeInput value="M1 1AE" onChange={mockOnChange} />);
    expect(input).toHaveValue('M1 1AE');
  });

  it('calls onChange when user types', async () => {
    const user = userEvent.setup();
    render(<PostcodeInput onChange={mockOnChange} />);
    
    const input = screen.getByRole('combobox');
    await user.type(input, 'SW1A');
    
    expect(mockOnChange).toHaveBeenCalled();
  });

  it('normalizes input to uppercase', async () => {
    const user = userEvent.setup();
    render(<PostcodeInput onChange={mockOnChange} />);
    
    const input = screen.getByRole('combobox');
    await user.type(input, 'sw1a');
    
    // Check that onChange was called with uppercase
    const lastCall = mockOnChange.mock.calls[mockOnChange.mock.calls.length - 1];
    expect(lastCall[0]).toMatch(/SW1A/);
  });

  describe('Autocomplete Suggestions', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('fetches suggestions after typing 3+ characters', async () => {
      const mockSuggestions = {
        result: [
          { postcode: 'SW1A 1AA' },
          { postcode: 'SW1A 2AA' },
        ],
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSuggestions,
      });

      const user = userEvent.setup({ delay: null });
      render(<PostcodeInput showSuggestions />);
      
      const input = screen.getByRole('combobox');
      
      // Type 3 characters
      await user.type(input, 'SW1');
      
      // Wait for debounce
      vi.advanceTimersByTime(300);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('postcodes.io/postcodes?q='),
          expect.any(Object)
        );
      });
    });

    it('displays suggestions in dropdown', async () => {
      const mockSuggestions = {
        result: [
          { postcode: 'SW1A 1AA' },
          { postcode: 'SW1A 2AA' },
        ],
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSuggestions,
      });

      const user = userEvent.setup({ delay: null });
      render(<PostcodeInput showSuggestions />);
      
      const input = screen.getByRole('combobox');
      await user.type(input, 'SW1A');
      
      vi.advanceTimersByTime(300);
      
      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
        expect(screen.getByText('SW1A 1AA')).toBeInTheDocument();
        expect(screen.getByText('SW1A 2AA')).toBeInTheDocument();
      });
    });

    it('respects maxSuggestions prop', async () => {
      const mockSuggestions = {
        result: Array.from({ length: 20 }, (_, i) => ({
          postcode: `SW1A ${i}AA`,
        })),
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSuggestions,
      });

      const user = userEvent.setup({ delay: null });
      render(<PostcodeInput showSuggestions maxSuggestions={3} />);
      
      const input = screen.getByRole('combobox');
      await user.type(input, 'SW1A');
      
      vi.advanceTimersByTime(300);
      
      await waitFor(() => {
        const options = screen.getAllByRole('option');
        expect(options.length).toBeLessThanOrEqual(3);
      });
    });
  });

  describe('Keyboard Navigation', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('navigates suggestions with arrow keys', async () => {
      const mockSuggestions = {
        result: [
          { postcode: 'SW1A 1AA' },
          { postcode: 'SW1A 2AA' },
          { postcode: 'SW1A 3AA' },
        ],
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSuggestions,
      });

      const user = userEvent.setup({ delay: null });
      render(<PostcodeInput showSuggestions />);
      
      const input = screen.getByRole('combobox');
      await user.type(input, 'SW1A');
      
      vi.advanceTimersByTime(300);
      
      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });
      
      // Press ArrowDown
      fireEvent.keyDown(input, { key: 'ArrowDown' });
      
      await waitFor(() => {
        const options = screen.getAllByRole('option');
        expect(options[0]).toHaveAttribute('aria-selected', 'true');
      });
      
      // Press ArrowDown again
      fireEvent.keyDown(input, { key: 'ArrowDown' });
      
      await waitFor(() => {
        const options = screen.getAllByRole('option');
        expect(options[1]).toHaveAttribute('aria-selected', 'true');
      });
    });

    it('selects suggestion with Enter key', async () => {
      const mockSuggestions = {
        result: [{ postcode: 'SW1A 1AA' }],
      };

      const mockVerification = {
        status: 200,
        ok: true,
        json: async () => ({ result: { postcode: 'SW1A 1AA' } }),
      };

      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockSuggestions,
        })
        .mockResolvedValueOnce(mockVerification);

      const user = userEvent.setup({ delay: null });
      render(<PostcodeInput showSuggestions onValid={mockOnValid} />);
      
      const input = screen.getByRole('combobox');
      await user.type(input, 'SW1A');
      
      vi.advanceTimersByTime(300);
      
      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });
      
      // Navigate to first suggestion
      fireEvent.keyDown(input, { key: 'ArrowDown' });
      
      // Select with Enter
      fireEvent.keyDown(input, { key: 'Enter' });
      
      await waitFor(() => {
        expect(input).toHaveValue('SW1A 1AA');
      });
    });

    it('closes dropdown with Escape key', async () => {
      const mockSuggestions = {
        result: [{ postcode: 'SW1A 1AA' }],
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSuggestions,
      });

      const user = userEvent.setup({ delay: null });
      render(<PostcodeInput showSuggestions />);
      
      const input = screen.getByRole('combobox');
      await user.type(input, 'SW1A');
      
      vi.advanceTimersByTime(300);
      
      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });
      
      // Press Escape
      fireEvent.keyDown(input, { key: 'Escape' });
      
      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      });
    });
  });

  describe('Verification', () => {
    it('verifies postcode on blur (valid exists)', async () => {
      const mockVerification = {
        status: 200,
        ok: true,
        json: async () => ({ result: { postcode: 'SW1A 1AA' } }),
      };

      (global.fetch as any).mockResolvedValueOnce(mockVerification);

      const user = userEvent.setup();
      render(<PostcodeInput onValid={mockOnValid} />);
      
      const input = screen.getByRole('combobox');
      await user.type(input, 'SW1A 1AA');
      
      // Blur the input
      fireEvent.blur(input);
      
      await waitFor(() => {
        expect(mockOnValid).toHaveBeenCalledWith('SW1A 1AA');
      }, { timeout: 2000 });
    });

    it('shows error when postcode does not exist', async () => {
      const mockVerification = {
        status: 404,
        ok: false,
      };

      (global.fetch as any).mockResolvedValueOnce(mockVerification);

      const user = userEvent.setup();
      render(<PostcodeInput />);
      
      const input = screen.getByRole('combobox');
      await user.type(input, 'ZZ1 1ZZ');
      
      // Blur the input
      fireEvent.blur(input);
      
      await waitFor(() => {
        expect(screen.getByText(/couldn't verify/i)).toBeInTheDocument();
      }, { timeout: 2000 });
    });

    it('shows error for invalid format on blur', async () => {
      const user = userEvent.setup();
      render(<PostcodeInput />);
      
      const input = screen.getByRole('combobox');
      await user.type(input, 'INVALID');
      
      // Blur the input
      fireEvent.blur(input);
      
      await waitFor(() => {
        expect(screen.getByText(/valid UK postcode format/i)).toBeInTheDocument();
      }, { timeout: 1000 });
    });
  });

  describe('ARIA Attributes', () => {
    it('has proper ARIA attributes', () => {
      render(<PostcodeInput />);
      
      const input = screen.getByRole('combobox');
      
      expect(input).toHaveAttribute('aria-autocomplete', 'list');
      expect(input).toHaveAttribute('aria-expanded');
      expect(input).toHaveAttribute('aria-controls');
    });

    it('updates aria-expanded when dropdown opens', async () => {
      const mockSuggestions = {
        result: [{ postcode: 'SW1A 1AA' }],
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSuggestions,
      });

      vi.useFakeTimers();
      const user = userEvent.setup({ delay: null });
      render(<PostcodeInput showSuggestions />);
      
      const input = screen.getByRole('combobox');
      expect(input).toHaveAttribute('aria-expanded', 'false');
      
      await user.type(input, 'SW1A');
      vi.advanceTimersByTime(300);
      
      await waitFor(() => {
        expect(input).toHaveAttribute('aria-expanded', 'true');
      });
      
      vi.useRealTimers();
    });

    it('sets aria-invalid when error exists', async () => {
      const user = userEvent.setup();
      render(<PostcodeInput />);
      
      const input = screen.getByRole('combobox');
      await user.type(input, 'INVALID');
      fireEvent.blur(input);
      
      await waitFor(() => {
        expect(input).toHaveAttribute('aria-invalid', 'true');
      }, { timeout: 1000 });
    });
  });

  describe('Disabled State', () => {
    it('disables input when disabled=true', () => {
      render(<PostcodeInput disabled />);
      
      const input = screen.getByRole('combobox');
      expect(input).toBeDisabled();
    });

    it('does not fetch suggestions when disabled', async () => {
      vi.useFakeTimers();
      const user = userEvent.setup({ delay: null });
      render(<PostcodeInput disabled showSuggestions />);
      
      const input = screen.getByRole('combobox');
      
      // Try to type (should not work)
      await user.type(input, 'SW1A');
      vi.advanceTimersByTime(300);
      
      expect(global.fetch).not.toHaveBeenCalled();
      
      vi.useRealTimers();
    });
  });
});

