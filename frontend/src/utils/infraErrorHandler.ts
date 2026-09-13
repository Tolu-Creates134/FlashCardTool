import { AxiosError } from 'axios';

/**
 * Determines if an error is caused by Azure Container Apps
 * Envoy proxy infrastructure duplication rather than a genuine failure.
 * The backend operation always completes successfully in these cases.
 * @param {Error} error - The axios error object
 * @returns {boolean}
 */
export const isInfrastructureError = (error : AxiosError) : boolean => {
    const status = error?.response?.status;
    return (
        status === 404 ||
        status === 502 ||
        status === 503 ||
        error?.message === 'Network Error'
    );
};