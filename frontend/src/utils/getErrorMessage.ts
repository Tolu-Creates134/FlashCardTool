import { isAxiosError } from 'axios';

/**
 * Returns a server or JavaScript error message, with a fallback for unknown errors.
 * @param {unknown} error - The caught error.
 * @param {string} fallback - Message to use when no error message is available.
 * @returns {string} A message suitable for display.
 */
export const getErrorMessage = (error: unknown, fallback: string): string => {
  if (isAxiosError<{ message?: unknown }>(error)) {
    const message = error.response?.data?.message;
    if (typeof message === 'string' && message) return message;
  }

  return error instanceof Error && error.message ? error.message : fallback;
};
