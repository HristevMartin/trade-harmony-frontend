// TODO: Replace with real AI API integration later

export interface JobDraft {
  categoryId: string;
  categoryLabel: string;
  title: string;
  description: string;
  urgency: 'urgent' | 'flexible' | 'planned';
  suggestedBudget?: {
    min?: number;
    max?: number;
    currency?: 'GBP';
  };
}

/**
 * Placeholder function that generates a mock job draft based on user input.
 * In production, this will call the AI API to generate structured job data.
 */
export function generateJobDraft(inputText: string): JobDraft {
  // Simple keyword matching to determine category
  const lowerInput = inputText.toLowerCase();
  
  let categoryId = 'general';
  let categoryLabel = 'General';
  
  if (lowerInput.includes('plumb') || lowerInput.includes('tap') || lowerInput.includes('leak') || lowerInput.includes('drain')) {
    categoryId = 'plumbing';
    categoryLabel = 'Plumbing';
  } else if (lowerInput.includes('electric') || lowerInput.includes('wire') || lowerInput.includes('socket') || lowerInput.includes('light')) {
    categoryId = 'electrical';
    categoryLabel = 'Electrical';
  } else if (lowerInput.includes('roof') || lowerInput.includes('tile') || lowerInput.includes('gutter')) {
    categoryId = 'roofing';
    categoryLabel = 'Roofing';
  } else if (lowerInput.includes('paint') || lowerInput.includes('decor')) {
    categoryId = 'painting';
    categoryLabel = 'Painting & Decorating';
  } else if (lowerInput.includes('garden') || lowerInput.includes('lawn') || lowerInput.includes('tree')) {
    categoryId = 'gardening';
    categoryLabel = 'Gardening';
  } else if (lowerInput.includes('carpenter') || lowerInput.includes('wood') || lowerInput.includes('door') || lowerInput.includes('cabinet')) {
    categoryId = 'carpentry';
    categoryLabel = 'Carpentry';
  } else if (lowerInput.includes('heat') || lowerInput.includes('boiler') || lowerInput.includes('cool') || lowerInput.includes('air')) {
    categoryId = 'heating-cooling';
    categoryLabel = 'Heating & Cooling';
  }

  // Determine urgency
  let urgency: 'urgent' | 'flexible' | 'planned' = 'flexible';
  if (lowerInput.includes('urgent') || lowerInput.includes('emergency') || lowerInput.includes('asap') || lowerInput.includes('immediately')) {
    urgency = 'urgent';
  } else if (lowerInput.includes('plan') || lowerInput.includes('next month') || lowerInput.includes('future')) {
    urgency = 'planned';
  }

  // Generate a simple title (first 50 chars or first sentence)
  const firstSentence = inputText.split('.')[0].trim();
  const title = firstSentence.length > 60 
    ? firstSentence.substring(0, 60) + '...'
    : firstSentence;

  // Budget suggestion based on category (mock data)
  const budgetRanges: Record<string, { min: number; max: number }> = {
    plumbing: { min: 50, max: 300 },
    electrical: { min: 80, max: 500 },
    roofing: { min: 500, max: 3000 },
    painting: { min: 200, max: 1500 },
    gardening: { min: 100, max: 800 },
    carpentry: { min: 150, max: 1200 },
    'heating-cooling': { min: 300, max: 2000 },
    general: { min: 100, max: 500 },
  };

  return {
    categoryId,
    categoryLabel,
    title,
    description: inputText,
    urgency,
    suggestedBudget: {
      ...budgetRanges[categoryId],
      currency: 'GBP',
    },
  };
}
