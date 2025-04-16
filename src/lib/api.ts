// API utility functions

/**
 * Fetch carbon footprint calculations for the current user
 */
export async function fetchCalculations() {
  const response = await fetch('/api/calculator/fetch', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch calculations');
  }

  return response.json();
} 