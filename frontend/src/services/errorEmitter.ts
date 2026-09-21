
interface ApiErrorDetail {
    message: string;
    status: number | undefined;
}

export interface EmitApiErrorInput {
    response?: {
        data?: {
            message?: string;
            error?: string;
        };
        status?: number;
    };
    message?: string;
}

/**
 * Dispatches a custom browser event containing a user friendly API error message.
 * Consumed by GlobalErrorToastr to display error toasts across the application.
 * @param {AxiosError} error - The axios error object
 * @returns {void}
 */
export const emitApiError = (error: EmitApiErrorInput): void => {
    if (typeof window === 'undefined') return;

    const message: string =
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    'Request failed';

    const status: number | undefined = error?.response?.status;

    const detail: ApiErrorDetail = {message, status}

    window.dispatchEvent(
        new CustomEvent<ApiErrorDetail>('api-error', {detail})
    )
}

