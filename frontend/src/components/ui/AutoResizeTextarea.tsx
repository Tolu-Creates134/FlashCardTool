import React, { useLayoutEffect, useRef, type TextareaHTMLAttributes } from 'react';

/**
 * Textarea that grows to fit its content.
 * @param {*} props
 * @returns
 */
const AutoResizeTextarea = ({ value, className = '', style, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }

    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [value]);

  return (
    <textarea
      {...props}
      ref={textareaRef}
      value={value}
      rows={props.rows ?? 2}
      className={className}
      style={{ ...style, overflow: 'hidden', resize: 'none' }}
    />
  );
};

export default AutoResizeTextarea;
