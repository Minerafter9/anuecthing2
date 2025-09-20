'use client';

import React, { useState, useCallback } from 'react';
import { DndProvider, useDrag, useDrop, DragSourceMonitor, DropTargetMonitor } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isBefore,
  startOfDay,
} from 'date-fns';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';

import type { Post } from './types';

interface CalendarViewProps {
  posts: Post[];
  onPostMove: (postId: string, newDate: Date) => void;
  onCreatePost: (date: Date) => void;
  onEditPost?: (post: Post) => void;
}

type DragItem = { id: string; type: 'post' };

const PostCard: React.FC<{ post: Post }> = ({ post }) => {
  const [{ isDragging }, dragRef] = useDrag(() => ({
    type: 'post',
    item: (): DragItem => ({ id: post.id, type: 'post' }),
    collect: (monitor: DragSourceMonitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }), [post.id]);

  return (
    <div
      ref={dragRef}
      className={`bg-white rounded-lg p-2 mb-2 shadow-sm border border-gray-200 cursor-move text-xs ${
        isDragging ? 'opacity-50' : ''
      }`}
      title={post.title}
    >
      <div className="font-medium text-gray-800 truncate">{post.title}</div>
      <div className="flex flex-wrap gap-1 mt-1">
        {post.platforms.map((platform) => (
          <span
            key={platform}
            className="px-1 py-0.5 rounded text-xs bg-blue-100 text-blue-800"
          >
            {platform}
          </span>
        ))}
      </div>
      <div
        className={`mt-1 text-xs font-medium ${
          post.status === 'published'
            ? 'text-green-600'
            : post.status === 'scheduled'
            ? 'text-blue-600'
            : 'text-gray-500'
        }`}
      >
        {post.status}
      </div>
    </div>
  );
};

const CalendarDay: React.FC<{
  date: Date;
  posts: Post[];
  isCurrentMonth: boolean;
  onPostMove: (postId: string, newDate: Date) => void;
  onCreatePost: (date: Date) => void;
  onEditPost?: (post: Post) => void;
}> = ({ date, posts, isCurrentMonth, onPostMove, onCreatePost, onEditPost }) => {
  const [{ isOver }, dropRef] = useDrop(() => ({
    accept: 'post',
    drop: (item: DragItem, _monitor: DropTargetMonitor) => {
      if (!item?.id) return;
      onPostMove(item.id, date);
    },
    collect: (monitor: DropTargetMonitor) => ({
      isOver: monitor.isOver({ shallow: true }),
    }),
  }), [date, onPostMove]);

  const dayPosts = posts.filter((post) =>
    isSameDay(new Date(post.scheduledDate as unknown as Date), date)
  );

  const today = startOfDay(new Date());
  const isPast = isBefore(startOfDay(date), today);

  return (
    <div
      ref={dropRef}
      className={`min-h-[120px] p-2 border border-gray-200 ${
        !isCurrentMonth
          ? 'bg-gray-50 text-gray-400'
          : isPast
          ? 'bg-gray-100 text-gray-400'
          : 'bg-white'
      } ${isOver ? 'bg-blue-50' : ''}`}
    >
      <div className="flex justify-between items-start mb-2">
        <span className="text-sm font-medium">{format(date, 'd')}</span>
        <button
          onClick={() => !isPast && onCreatePost(date)}
          className={`text-gray-400 hover:text-blue-600 transition-colors ${
            isPast ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''
          }`}
          disabled={isPast}
          aria-label={`Create post on ${format(date, 'PPP')}`}
          type="button"
        >
          <Plus size={14} />
        </button>
      </div>
      <div className="space-y-1">
        {dayPosts.map((post) => (
          <div key={post.id} className="flex flex-wrap gap-1">
            <div
              onDoubleClick={(e) => {
                e.stopPropagation();
                onEditPost?.(post);
              }}
            >
              <PostCard post={post} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const CalendarView: React.FC<CalendarViewProps> = ({
  posts,
  onPostMove,
  onCreatePost,
  onEditPost,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const navigateMonth = useCallback((direction: 'prev' | 'next') => {
    setCurrentDate((prev) => (direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1)));
  }, []);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Previous month"
              type="button"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Next month"
              type="button"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-0 border border-gray-200 rounded-lg overflow-hidden">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div
              key={day}
              className="bg-gray-50 p-3 text-center font-medium text-gray-700 border-b border-gray-200"
            >
              {day}
            </div>
          ))}

          {calendarDays.map((date) => (
            <CalendarDay
              key={date.toISOString()}
              date={date}
              posts={posts}
              isCurrentMonth={isSameMonth(date, currentDate)}
              onPostMove={onPostMove}
              onCreatePost={onCreatePost}
              onEditPost={onEditPost}
            />
          ))}
        </div>
      </div>
    </DndProvider>
  );
};
