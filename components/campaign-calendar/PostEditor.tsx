'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { X, Image as ImageIcon, Eye, EyeOff, Loader2 } from 'lucide-react';

// Paste-ready: if you already define Post elsewhere, ensure it includes `title` and `scheduledAt`.
export type Post = {
  id?: string;
  title: string;        // NEW
  text: string;
  platforms: string[];
  mediaUrl?: string;
  scheduledAt?: string; // NEW (e.g., '2025-09-21T13:30')
};

export type PostEditorProps = {
  post?: Post;
  onSave: (post: Post) => void;
  onClose: () => void; // Will be called by ✕ button, Escape key, and clicking backdrop
};

// If your project already exports PLATFORMS elsewhere, remove this and keep your import.
const PLATFORMS: { id: string; name: string }[] = [
  { id: 'instagram', name: 'Instagram' },
  { id: 'tiktok', name: 'TikTok' },
  { id: 'facebook', name: 'Facebook' },
  { id: 'linkedin', name: 'LinkedIn' },
];

export const PostEditor: React.FC<PostEditorProps> = ({ post, onSave, onClose }) => {
  const isEditing = Boolean(post?.id ?? post);

  // --- State (keeps your existing layout/format) ---
  const [title, setTitle] = useState<string>(post?.title ?? '');
  const [text, setText] = useState<string>(post?.text ?? '');
  const [platforms, setPlatforms] = useState<string[]>(post?.platforms ?? []);
  const [scheduledAt, setScheduledAt] = useState<string>(post?.scheduledAt ?? '');

  // Image preview state
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaUrl, setMediaUrl] = useState<string | undefined>(post?.mediaUrl);

  // UI state
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  // Clean up object URLs
  useEffect(() => {
    return () => {
      if (mediaUrl && mediaUrl.startsWith('blob:')) URL.revokeObjectURL(mediaUrl);
    };
  }, [mediaUrl]);

  // Allow closing with Escape key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const togglePlatform = useCallback((id: string) => {
    setPlatforms((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));
  }, []);

  const onPickMedia = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const nextUrl = URL.createObjectURL(file);
    setMediaFile(file);
    setMediaUrl((prev) => {
      if (prev && prev.startsWith('blob:')) URL.revokeObjectURL(prev);
      return nextUrl;
    });
  }, []);

  const onSubmit = useCallback(async () => {
    setSaving(true);
    try {
      const payload: Post = {
        id: post?.id,
        title,
        text,
        platforms,
        mediaUrl,
        scheduledAt,
      };
      onSave(payload);
    } finally {
      setSaving(false);
    }
  }, [onSave, post?.id, title, text, platforms, mediaUrl, scheduledAt]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop (click to close) */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-5xl rounded-xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-gray-900">{isEditing ? 'Edit Post' : 'Create a Post'}</h2>
          </div>
          <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-700" aria-label="Close editor">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-0">
          {/* Composer */}
          <div className="min-h-[560px] max-h-[75vh] overflow-y-auto border-r p-6">
            {/* Title */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                type="text"
                placeholder="Post title"
                className="w-full rounded-lg border border-gray-300 p-3 text-sm shadow-sm outline-none focus:border-blue-600"
              />
            </div>

            {/* Platforms */}
            <div className="mt-6">
              <p className="mb-2 text-sm font-medium text-gray-700">Platforms</p>
              <div className="flex flex-wrap gap-2">
                {PLATFORMS.map((pf) => {
                  const active = platforms.includes(pf.id);
                  return (
                    <button
                      key={pf.id}
                      type="button"
                      onClick={() => togglePlatform(pf.id)}
                      className={`rounded-full border px-3 py-1.5 text-sm transition ${
                        active ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {pf.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Caption */}
            <div className="mt-6">
              <label className="mb-2 block text-sm font-medium text-gray-700">Caption</label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={6}
                placeholder="Write something engaging…"
                className="w-full resize-y rounded-lg border border-gray-300 p-3 text-sm shadow-sm outline-none focus:border-blue-600"
              />
            </div>

            {/* Media picker & inline thumbnail */}
            <div className="mt-6">
              <label className="mb-2 block text-sm font-medium text-gray-700">Attach image</label>
              <div className="flex items-center gap-3">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  <ImageIcon className="h-4 w-4" />
                  <span>Choose image</span>
                  <input type="file" accept="image/*" className="hidden" onChange={onPickMedia} />
                </label>
                {mediaUrl && (
                  <div className="rounded bg-gray-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={mediaUrl} alt="attached" className="h-28 w-48 object-cover" />
                  </div>
                )}
              </div>
            </div>

            {/* Schedule */}
            <div className="mt-6">
              <label className="mb-2 block text-sm font-medium text-gray-700">Schedule (date & time)</label>
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="w-full rounded-lg border border-gray-300 p-3 text-sm shadow-sm outline-none focus:border-blue-600"
              />
              <p className="mt-1 text-xs text-gray-500">Uses your local timezone. Convert to UTC in your backend if needed.</p>
            </div>

            {/* Actions */}
            <div className="mt-8 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowPreview((v) => !v)}
                  className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  {showPreview ? 'Hide preview' : 'Show preview'}
                </button>
              </div>
              <button
                type="button"
                onClick={onSubmit}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {isEditing ? 'Save changes' : 'Schedule / Save'}
              </button>
            </div>
          </div>

          {/* Preview panel */}
          <div className="max-h-[75vh] min-h-[560px] overflow-y-auto bg-gray-50 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-medium text-gray-800">Preview</h3>
              <span className="text-xs text-gray-500">(Format preserved)</span>
            </div>

            {!showPreview ? (
              <p className="text-sm text-gray-500">Turn on preview to see how your post will look on each platform.</p>
            ) : (
              <div className="space-y-4">
                {platforms.length === 0 && (
                  <div className="rounded-lg border border-dashed border-gray-300 bg-white p-6 text-sm text-gray-500">
                    Select at least one platform to preview.
                  </div>
                )}

                {platforms.map((platformId) => {
                  const platform = PLATFORMS.find((p) => p.id === platformId);
                  if (!platform) return null;
                  return (
                    <div key={platformId} className="rounded-lg bg-white p-4 shadow">
                      <div className="mb-1 text-sm font-semibold text-gray-800">{platform.name}</div>
                      <div className="text-[13px] font-medium text-gray-900">{title || 'Untitled post'}</div>
                      <p className="mt-1 whitespace-pre-wrap text-sm text-gray-800">{text || 'Your caption will appear here…'}</p>
                      {mediaUrl && (
                        <div className="mt-3 overflow-hidden rounded-lg">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={mediaUrl} alt="post media preview" className="max-h-80 w-full object-cover" />
                        </div>
                      )}
                      {scheduledAt && (
                        <div className="mt-3 text-xs text-gray-500">Scheduled: {scheduledAt}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostEditor;

/* ----------------------------------------------------
Parent integration example (page.tsx) to make the close button work.
If you already have this, just ensure onClose toggles the state.

"use client";
import React, { useState } from 'react';
import PostEditor, { type Post } from '@/components/campaign-calendar/PostEditor';

export default function CampaignCalendarPage() {
  const [showEditor, setShowEditor] = useState(false);

  const handleSave = (p: Post) => {
    // TODO: Persist to backend
    console.log('saved', p);
    setShowEditor(false); // close after save if you want
  };

  return (
    <div className="p-6">
      <button
        className="rounded-md bg-blue-600 px-4 py-2 text-white"
        onClick={() => setShowEditor(true)}
      >
        Create a Post
      </button>

      {showEditor && (
        <PostEditor
          onSave={handleSave}
          onClose={() => setShowEditor(false)} // ✕ button, ESC, and backdrop will call this
        />
      )}
    </div>
  );
}
----------------------------------------------------- */
