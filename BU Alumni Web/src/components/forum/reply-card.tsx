'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Pencil, Trash2, Reply } from 'lucide-react';
import { AuthorBlock } from './author-block';
import { VoteBar } from './vote-bar';
import { ReplyForm } from './reply-form';
import { RenderBody } from './render-body';
import type { ForumReply, Profile } from '@/lib/types';

interface ReplyCardProps {
  reply: ForumReply;
  threadAuthorId: string;
  userId: string | null;
  userRole?: string;
  userVote?: 'up' | 'down' | null;
  onVote?: (replyId: string, voteType: 'up' | 'down') => void;
  onMarkAsAnswer?: (replyId: string) => void;
  onEdit?: (replyId: string, body: string, plainText: string) => void;
  onDelete?: (replyId: string) => void;
  onReply?: (parentId: string, body: string, plainText: string) => void;
  depth?: number;
  children?: React.ReactNode;
}

export function ReplyCard({
  reply,
  threadAuthorId,
  userId,
  userRole,
  userVote,
  onVote,
  onMarkAsAnswer,
  onEdit,
  onDelete,
  onReply,
  depth = 0,
  children,
}: ReplyCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const isAuthor = userId === reply.author_id;
  const isAdmin = userRole === 'admin' || userRole === 'moderator';
  const canModerate = isAdmin;
  const canEdit = isAuthor && !reply.is_deleted;
  const canDelete = (isAuthor || canModerate) && !reply.is_deleted;

  const handleEdit = async (body: string, plainText: string) => {
    await onEdit?.(reply.id, body, plainText);
    setIsEditing(false);
  };

  const handleReply = async (body: string, plainText: string) => {
    await onReply?.(reply.id, body, plainText);
    setIsReplying(false);
  };

  if (reply.is_deleted) {
    return (
      <div className={`${depth > 0 ? 'ml-6' : ''} py-3 px-4 rounded-lg border border-dashed border-[hsl(var(--mist))] opacity-50`}>
        <p className="text-sm text-[hsl(var(--slate))] italic">
          {canModerate ? '[deleted — moderators can restore]' : '[deleted]'}
        </p>
      </div>
    );
  }

  return (
    <div className={depth > 0 ? 'ml-6 pl-4 border-l-2 border-[hsl(var(--fog))] dark:border-[hsl(var(--mist))]' : ''}>
      <div className={`relative flex gap-0 rounded-xl overflow-hidden bg-[hsl(var(--card))] border border-[hsl(var(--border))] shadow-warm hover:shadow-warm-lg transition-all duration-300 ${
        reply.is_accepted ? 'ring-1 ring-[hsl(var(--jungle))]/30' : ''
      }`}>
        {/* Vote sidebar */}
        <div className="flex flex-col items-center gap-0.5 py-3 px-2 bg-[hsl(var(--parchment))] dark:bg-[hsl(var(--sidebar-accent))] min-w-[44px]">
          <VoteBar
            upvotes={reply.upvotes || 0}
            downvotes={reply.downvotes || 0}
            userVote={userVote}
            onVote={(type) => onVote?.(reply.id, type)}
            size="sm"
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 p-4">
          <AuthorBlock
            author={reply.author as Profile}
            createdAt={reply.created_at}
            updatedAt={reply.updated_at}
            editCount={reply.edit_count}
            size="sm"
            meta={
              reply.is_accepted ? (
                <Badge className="bg-[hsl(var(--jungle))]/10 text-[hsl(var(--jungle))] border-[hsl(var(--jungle))]/20 text-xs font-semibold">
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  Answer
                </Badge>
              ) : null
            }
          />

          {isEditing ? (
            <ReplyForm
              initialValue={reply.body}
              onSubmit={handleEdit}
              onCancel={() => setIsEditing(false)}
              submitLabel="Save Changes"
            />
          ) : (
            <div className="mt-2 text-[15px] leading-relaxed text-[hsl(var(--charcoal))] dark:text-[hsl(var(--charcoal))]">
              <RenderBody body={reply.body} />
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2 mt-3">
            {onReply && !isReplying && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs rounded-lg text-[hsl(var(--slate))] hover:text-[hsl(var(--jungle))] hover:bg-[hsl(var(--jungle))]/5 transition-colors"
                onClick={() => setIsReplying(true)}
              >
                <Reply className="mr-1 h-3 w-3" />
                Reply
              </Button>
            )}
            {canEdit && !isEditing && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs rounded-lg text-[hsl(var(--slate))] hover:text-[hsl(var(--copper))] hover:bg-[hsl(var(--copper))]/5 transition-colors"
                onClick={() => setIsEditing(true)}
              >
                <Pencil className="mr-1 h-3 w-3" />
                Edit
              </Button>
            )}
            {canDelete && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs rounded-lg text-[hsl(var(--slate))] hover:text-[hsl(var(--terracotta))] hover:bg-[hsl(var(--terracotta))]/5 transition-colors"
                onClick={() => onDelete?.(reply.id)}
              >
                <Trash2 className="mr-1 h-3 w-3" />
                Delete
              </Button>
            )}
            {userId === threadAuthorId && !reply.is_accepted && onMarkAsAnswer && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs rounded-lg text-[hsl(var(--slate))] hover:text-[hsl(var(--jungle))] hover:bg-[hsl(var(--jungle))]/5 transition-colors"
                onClick={() => onMarkAsAnswer(reply.id)}
              >
                <CheckCircle2 className="mr-1 h-3 w-3" />
                Mark as Answer
              </Button>
            )}
          </div>

          {isReplying && (
            <div className="mt-3">
              <ReplyForm
                onSubmit={handleReply}
                onCancel={() => setIsReplying(false)}
                submitLabel="Post Reply"
                placeholder={`Replying to ${reply.author?.full_name || '...'}`}
              />
            </div>
          )}
        </div>
      </div>

      {children}
    </div>
  );
}
