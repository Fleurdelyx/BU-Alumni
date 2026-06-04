'use client';

import { useState } from 'react';
import { RichEditor } from './rich-editor';
import { Button } from '@/components/ui/button';
import { Send, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ReplyFormProps {
  initialValue?: string;
  onSubmit: (body: string, plainText: string) => void;
  onCancel?: () => void;
  submitLabel?: string;
  placeholder?: string;
  disabled?: boolean;
}

export function ReplyForm({
  initialValue = '',
  onSubmit,
  onCancel,
  submitLabel = 'Post Reply',
  placeholder = 'Write your reply...',
  disabled = false,
}: ReplyFormProps) {
  const { toast } = useToast();
  const [body, setBody] = useState(initialValue);
  const [plainText, setPlainText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (html: string, text: string) => {
    setBody(html);
    setPlainText(text);
  };

  const handleSubmit = async () => {
    const trimmed = plainText.trim();
    if (!trimmed || disabled) return;
    setSubmitting(true);
    try {
      await onSubmit(body, plainText);
      setBody('');
      setPlainText('');
    } catch (err: any) {
      console.error('Failed to submit reply:', err);
      toast({ title: 'Failed to post reply', description: err?.message || 'Please try again.', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-3">
      <RichEditor
        content={body}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled || submitting}
      />
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button variant="outline" size="sm" onClick={onCancel} disabled={submitting}>
            <X className="mr-1 h-4 w-4" />
            Cancel
          </Button>
        )}
        <Button size="sm" onClick={handleSubmit} disabled={!plainText.trim() || submitting || disabled}>
          <Send className="mr-2 h-4 w-4" />
          {submitting ? 'Posting...' : submitLabel}
        </Button>
      </div>
    </div>
  );
}
