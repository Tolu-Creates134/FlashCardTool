import React, {useEffect, useState} from 'react'
import ErrorToastr from './ErrorToastr';

/**
 * Global error toastr message component.
 * @returns
 */
const GlobalErrorToastr = () => {
    const [apiError, setApiError] = useState(null);

    useEffect(() => {
        const handleApiError = (event) => {
            const detail = event?.detail || {};
            setApiError({
                id: Date.now(),
                message: detail.message || 'Request failed'
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