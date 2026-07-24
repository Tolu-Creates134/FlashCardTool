import React from 'react';
import DOMPurify from 'dompurify';

/**
 * Safely renders sanitized rich text HTML content.
 * @param {*} param0
 * @returns
 */
const RichTextContent = ({ html, className = '' }) => {
    const safeHtml = DOMPurify.sanitize(html || '', {
        USE_PROFILES: { html: true },
    });

    return (
        <div
            className={`flashlearn-richtext ${className}`.trim()}
            dangerouslySetInnerHTML={{ __html: safeHtml }}
        />
    );
};

export default RichTextContent;
