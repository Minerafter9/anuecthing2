
"use client";

import React, { useState, useCallback } from "react";
import { CalendarView } from "@/components/campaign-calendar/CalendarView";
import PostEditor, { type Post } from "@/components/campaign-calendar/PostEditor"; // default export
import { ContentUploader } from "@/components/campaign-calendar/ContentUploader";
import { Plus, Settings, BarChart3 } from "lucide-react";

export default function CampaignCalendarPage() {
  const [showEditor, setShowEditor] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | undefined>(undefined);

  const openCreate = useCallback(() => {
    setEditingPost(undefined);
    setShowEditor(true);
  }, []);

  const openEdit = useCallback((p: Post) => {
    setEditingPost(p);
    setShowEditor(true);
  }, []);

  const closeEditor = useCallback(() => setShowEditor(false), []);

  const handleSave = useCallback((p: Post) => {
    // TODO: persist `p` to your backend or local store
    console.log("Saving post:", p);
    setShowEditor(false); // auto-close after save (optional)
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b px-6 py-4">
        <h1 className="text-lg font-semibold text-gray-900">Campaign Calendar</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Create a Post
          </button>
          <button className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
            <Settings className="mr-2 inline-block h-4 w-4" />
            Settings
          </button>
          <button className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
            <BarChart3 className="mr-2 inline-block h-4 w-4" />
            Insights
          </button>
        </div>
      </div>

      {/* Main area */}
      <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-4">
        <div className="lg:col-span-3">
          <CalendarView
            // If your CalendarView can open the editor, pass these:
            // onCreateSlot={openCreate}
            // onEditPost={openEdit}
          />
        </div>
        <div className="lg:col-span-1 space-y-6">
          <ContentUploader />
        </div>
      </div>

      {/* Overlay editor */}
      {showEditor && (
        <PostEditor post={editingPost} onSave={handleSave} onClose={closeEditor} />
      )}
    </div>
  );
}

