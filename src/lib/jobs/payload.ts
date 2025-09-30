// TODO: Replace submitJob with real API integration

import type { JobDraft } from "@/lib/ai/placeholders";

export interface JobPayload {
  categoryId: string;
  title: string;
  description: string;
  urgency: 'urgent' | 'flexible' | 'planned';
  budget?: {
    min?: number;
    max?: number;
    currency: 'GBP';
  };
  location: {
    country: string;
    city: string;
    postcode: string;
    lat?: number;
    lng?: number;
  };
  photos?: Array<{
    name: string;
    mime: string;
    size: number;
    tempUrl?: string;
  }>;
  meta?: {
    aiDraftApplied?: boolean;
    source?: 'homepage-assistant' | 'manual';
  };
}

interface FormState {
  country: string;
  city: string;
  postcode: string;
  lat?: number;
  lng?: number;
  categoryId: string;
  title: string;
  description: string;
  urgency: 'urgent' | 'flexible' | 'planned';
  budgetMin?: number;
  budgetMax?: number;
  photos?: Array<{
    name: string;
    mime: string;
    size: number;
    tempUrl?: string;
  }>;
}

/**
 * Prepares a clean, validated job payload ready for API submission
 */
export function prepareJobPayload(
  formState: FormState,
  draft?: JobDraft | null
): JobPayload {
  // Trim and normalize strings
  const title = formState.title.trim();
  const description = formState.description.trim();
  const city = formState.city.trim();
  const postcode = formState.postcode.trim().toUpperCase();

  // Build budget object only if values are provided
  let budget: JobPayload['budget'] = undefined;
  if (formState.budgetMin || formState.budgetMax) {
    budget = {
      min: formState.budgetMin || undefined,
      max: formState.budgetMax || undefined,
      currency: 'GBP',
    };
  }

  // Infer metadata
  const meta: JobPayload['meta'] = {
    aiDraftApplied: !!draft,
    source: draft ? 'homepage-assistant' : 'manual',
  };

  return {
    categoryId: formState.categoryId,
    title,
    description,
    urgency: formState.urgency,
    budget,
    location: {
      country: formState.country,
      city,
      postcode,
      lat: formState.lat,
      lng: formState.lng,
    },
    photos: formState.photos?.filter(p => p.tempUrl), // Only include photos with URLs
    meta,
  };
}

/**
 * Submits the job to the backend API
 * TODO: Replace this with actual API call
 */
export async function submitJob(payload: JobPayload): Promise<{ ok: boolean; id: string; error?: string }> {
  console.log('📦 Job Payload:', JSON.stringify(payload, null, 2));

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Mock successful response
  return {
    ok: true,
    id: `job-${Date.now()}`,
  };
}
