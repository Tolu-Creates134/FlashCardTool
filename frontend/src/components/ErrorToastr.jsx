import React, { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react';

const ErrorToastr = ({ message, onClose, duration = 5000, id}) => {


    useEffect(() => {
        const timer = setTimeout(onClose, duration);
        return () => clearTimeout(timer);
    }, [duration, onClose])

    const content = (
        <div className="fixed inset-x-0 bottom-6 z-50 flex justify-center">
            <div
                className="flex max-w-sm items-start rounded-md border border-red-200 bg-white/95 shadow-lg backdrop-blur-sm animate-slide-in"
                role="alert"
                aria-live="assertive"
            >
                <div className="h-full w-1 rounded-l-md bg-red-500" />
                <div className="px-3 py-2 text-sm text-red-700">{message}</div>
                <button
                    onClick={onClose}
                    className="p-2 text-red-500 hover:text-red-600"
                    aria-label="Close"
                >
                    <X size={16} />
                </button>
            </div>
        </div>
    );
    
    return createPortal(content, document.body)
}

export default ErrorToastr
