import React, { useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Loader2, Send, Shield } from 'lucide-react';
import useToast from '../hooks/useToast';
import { cn } from '../lib/utils';

const responseSchema = z.object({
  message: z.string().min(1, 'Response message is required'),
  is_internal: z.boolean(),
});

type ResponseFormData = z.infer<typeof responseSchema>;

interface ResponseFormProps {
  onSubmit: (data: ResponseFormData) => Promise<void>;
  isLoading?: boolean;
  isAdmin?: boolean;
  isDisabled?: boolean;
}

export const ResponseForm: React.FC<ResponseFormProps> = ({
  onSubmit,
  isLoading = false,
  isAdmin = false,
  isDisabled = false,
}) => {
  const { register, handleSubmit, formState: { errors }, watch, setValue, reset } = useForm<ResponseFormData>({
    resolver: zodResolver(responseSchema),
    defaultValues: {
      message: '',
      is_internal: false,
    },
  });

  const { setToastMessage } = useToast();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const { ref: registerRef, ...registerRest } = register('message');
  const isInternal = watch('is_internal');
  const messageValue = watch('message');

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 160) + 'px';
  }, [messageValue]);

  const handleFormSubmit = async (data: ResponseFormData) => {
    try {
      await onSubmit(data);
      setToastMessage({ message: 'Response added successfully', variant: 'success' });
      reset();
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && !isDisabled && messageValue?.trim()) {
        handleSubmit(handleFormSubmit)();
      }
    }
  };

  return (
    <div
      className={cn(
        'rounded-2xl border bg-white shadow-sm transition-all',
        isInternal
          ? 'border-indigo-200 ring-1 ring-indigo-100'
          : 'border-gray-200 focus-within:border-gray-300 focus-within:ring-1 focus-within:ring-gray-200',
        (isDisabled) && 'opacity-60 pointer-events-none'
      )}
    >
      {/* Internal banner */}
      {isAdmin && isInternal && (
        <div className="flex items-center gap-1.5 px-4 pt-3 text-xs font-medium text-indigo-500">
          <Shield className="h-3 w-3" />
          Internal note — only visible to admins
        </div>
      )}

      {/* Textarea */}
      <div className="px-4 pt-3 pb-2">
        <textarea
          {...registerRest}
          ref={(el) => {
            registerRef(el);
            (textareaRef as React.MutableRefObject<HTMLTextAreaElement | null>).current = el;
          }}
          placeholder={
            isDisabled
              ? 'Responses are disabled for this claim'
              : isAdmin
              ? 'Write an official response…'
              : 'Write a comment…'
          }
          rows={1}
          disabled={isLoading || isDisabled}
          onKeyDown={handleKeyDown}
          className={cn(
            'w-full resize-none bg-transparent text-sm text-gray-800 placeholder:text-gray-400',
            'focus:outline-none focus:ring-0 border-none p-0',
            'leading-relaxed max-h-40 overflow-y-auto'
          )}
          style={{ height: 'auto' }}
        />
        {errors.message && (
          <p className="mt-1 text-xs text-red-400">{errors.message.message}</p>
        )}
      </div>

      {/* Bottom toolbar */}
      <div className="flex items-center justify-between gap-3 px-3 pb-3">
        {/* Internal toggle (admin only) */}
        {isAdmin ? (
          <button
            type="button"
            onClick={() => setValue('is_internal', !isInternal)}
            className={cn(
              'flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border transition-colors',
              isInternal
                ? 'bg-indigo-50 border-indigo-200 text-indigo-600'
                : 'bg-gray-50 border-gray-200 text-gray-400 hover:text-gray-600 hover:border-gray-300'
            )}
          >
            <Shield className="h-3 w-3" />
            {isInternal ? 'Internal' : 'Mark internal'}
          </button>
        ) : (
          <span className="text-[11px] text-gray-400 pl-1">
            Press <kbd className="rounded bg-gray-100 px-1 py-0.5 text-[10px] font-mono text-gray-500">Enter</kbd> to send · <kbd className="rounded bg-gray-100 px-1 py-0.5 text-[10px] font-mono text-gray-500">Shift+Enter</kbd> for new line
          </span>
        )}

        <div className="flex items-center gap-2">
          {isAdmin && (
            <span className="text-[11px] text-gray-400 hidden sm:inline">
              <kbd className="rounded bg-gray-100 px-1 py-0.5 text-[10px] font-mono text-gray-500">Enter</kbd> send ·{' '}
              <kbd className="rounded bg-gray-100 px-1 py-0.5 text-[10px] font-mono text-gray-500">⇧ Enter</kbd> newline
            </span>
          )}

          <button
            type="button"
            onClick={handleSubmit(handleFormSubmit)}
            disabled={isLoading || isDisabled || !messageValue?.trim()}
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-full transition-all',
              messageValue?.trim() && !isLoading
                ? isInternal
                  ? 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-sm'
                  : 'bg-gray-800 hover:bg-gray-900 text-white shadow-sm'
                : 'bg-gray-100 text-gray-300 cursor-not-allowed'
            )}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-3.5 w-3.5 translate-x-px" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};