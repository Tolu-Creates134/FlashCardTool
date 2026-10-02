import React, {useEffect, useState} from 'react'
import ErrorToastr from './ErrorToastr';

/**
 * Global error toastr message component.
 * @returns
 */
const GlobalErrorToastr = () => {
    const [apiError, setApiError] = useState<{ id: number; message: string } | null>(null);

    useEffect(() => {
        const handleApiError = (event: Event) => {
            const detail: unknown = event instanceof CustomEvent ? event.detail : undefined;
            const message = detail && typeof detail === 'object' && 'message' in detail
              && typeof detail.message === 'string' ? detail.message : '';
            setApiError({
                id: Date.now(),
                message: message || 'Request failed'
            })
        }

        window.addEventListener('api-error', handleApiError);
        return () => window.removeEventListener('api-error', handleApiError)
    }, [])

    if (!apiError) return null
    
  return (
    <ErrorToastr
        id={apiError.id}
        message={apiError.message}
        onClose={() => setApiError(null)}
    />
  )
}

export default GlobalErrorToastr