'use client';

import DOMPurify from 'dompurify';
import { useMemo } from 'react';

interface RenderBodyProps {
  body: string | null | undefined;
  className?: string;
}

export function RenderBody({ body, className = '' }: RenderBodyProps) {
  const html = useMemo(() => {
    if (!body) return '';
    if (body.trim().startsWith('<')) {
      return DOMPurify.sanitize(body, {
        ALLOWED_TAGS: [
          'p', 'br', 'strong', 'em', 'u', 's', 'a', 'ul', 'ol', 'li',
          'blockquote', 'code', 'pre', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
          'img', 'div', 'span',
        ],
        ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'src', 'alt', 'title'],
      });
    }
    const escaped = body
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    return escaped
      .split(/\n{2,}/)
      .map((p) => `<p>${p.replace(/\n/g, '<br>')}</p>`)
      .join('');
  }, [body]);

  return (
    <div
      className={`prose prose-sm max-w-none dark:prose-invert ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
