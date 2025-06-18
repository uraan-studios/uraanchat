// app/chat/components/ChatInput.tsx
'use client';

import React, { useRef, KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import {
  Send,
  Dice3,
  Sparkles,
  Lightbulb,
  Paperclip,
  X,
  Loader,
} from 'lucide-react';
import { toast } from 'sonner';

// The Attachment type can be defined here or in a shared types file
export interface Attachment {
  id: string;
  key: string; // Key is now required after upload
  name: string;
  size: number;
  type: string;
  isUploading: boolean;
}

interface ChatInputProps {
  input: string;
  handleInputChange: (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>,
  ) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
  randomPrompt: () => void;
  lorem: () => void;
  idea: () => void;
  // New props for managing attachments from the parent
  attachments: Attachment[];
  setAttachments: React.Dispatch<React.SetStateAction<Attachment[]>>;
  allowImage?: boolean;
  allowDocument?: boolean;
}

export function ChatInput({
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
  randomPrompt,
  lorem,
  idea,
  attachments,
  setAttachments, // Receive state and setter from parent
  allowImage,
  allowDocument,
}: ChatInputProps) {
  const textRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      // Allow submission if there's text OR attachments
      if (input.trim() || attachments.length > 0) {
        // Only call handleSubmit if e.target is a form element
        const form = e.currentTarget.form;
        if (form) {
          const event = new Event('submit', { bubbles: true, cancelable: true });
          form.dispatchEvent(event);
        }
      }
    }
  };

  const autoGrow = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const t = e.currentTarget;
    const lineHeight = 20;
    const max = 15 * lineHeight;
    t.style.height = 'auto';
    t.style.height = `${Math.min(t.scrollHeight, max)}px`;
  };

  const triggerFileSelect = () => {
    if (attachments.length >= 3) {
      toast('Maximum of 3 attachments allowed');
      return;
    }
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const tempId = Date.now().toString();
    const newAttachment: Attachment = {
      id: tempId,
      key: '', // Key is initially empty
      name: file.name,
      size: file.size,
      type: file.type,
      isUploading: true,
    };
    setAttachments((prev) => [...prev, newAttachment]);

    try {
      const uploadInitResp = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
        }),
      });
      if (!uploadInitResp.ok) throw new Error('Failed to get upload URL');
      const { url, key } = await uploadInitResp.json();

      const uploadResp = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });
      if (!uploadResp.ok) throw new Error('File upload failed');

      // No need for a separate confirm step if the key is returned in step 1
      setAttachments((prev) =>
        prev.map((att) =>
          att.id === tempId ? { ...att, key, isUploading: false } : att,
        ),
      );
      toast('File uploaded successfully');
    } catch (error: any) {
      setAttachments((prev) => prev.filter((att) => att.id !== tempId));
      toast.error('Failed to upload file: ' + error.message);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((att) => att.id !== id));
  };

  // A message is submittable if it's not loading and has text OR attachments
  const canSubmit = !isLoading && (input.trim().length > 0 || attachments.length > 0);

  return (
    <div className="w-full bg-gray-50 dark:bg-gray-900/40 py-3">
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto w-full px-4">
        <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl shadow">
          <div className="flex flex-col">
            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-2 px-4 pt-4">
                {attachments.map((att) => (
                  <div
                    key={att.id}
                    className="flex items-center gap-2 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-gray-100 dark:bg-gray-700 relative"
                  >
                    <span className="text-sm">{att.name}</span>
                    {att.isUploading && (
                      <Loader className="w-4 h-4 animate-spin text-gray-500" />
                    )}
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => removeAttachment(att.id)}
                      title="Remove attachment"
                      className="p-0 h-4 w-4"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <textarea
              ref={textRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={onKeyDown}
              onInput={autoGrow}
              placeholder="Type your message…"
              rows={1}
              className="w-full resize-none bg-transparent p-4 focus:outline-none rounded-t-xl max-h-[300px]"
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center justify-between border-t dark:border-gray-700 px-3 py-2">
            <div className="flex gap-2">
              <Button type="button" size="icon" variant="ghost" onClick={randomPrompt} title="Random example prompt">
                <Dice3 className="w-4 h-4" />
              </Button>
              <Button type="button" size="icon" variant="ghost" onClick={lorem} title="Add lorem ipsum">
                <Sparkles className="w-4 h-4" />
              </Button>
              <Button type="button" size="icon" variant="ghost" onClick={idea} title="Creative idea">
                <Lightbulb className="w-4 h-4" />
              </Button>
              <Button type="button" size="icon" variant="ghost" onClick={triggerFileSelect} title="Attach a file" disabled={attachments.length >= 3 || isLoading}>
                <Paperclip className="w-4 h-4" />
              </Button>
            </div>

            <Button type="submit" disabled={!canSubmit} className="rounded-full w-10 h-10 p-0 shrink-0">
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </form>
      <input ref={fileInputRef} type="file" hidden onChange={handleFileChange} />
    </div>
  );
}