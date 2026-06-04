'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Pencil, Trash2, Reply } from 'lucide-react';
import { AuthorBlock } from './author-block';
import { ReactionBar } from './reaction-bar';
import { ReplyForm } from './reply-form';
import { RenderBody } from './render-body';
import type { ForumReply, Profile } from '@/lib/types';

interface ReplyCardProps {
  reply: ForumReply;
  threadAuthorId: string;
  userId: string | null;
  userRole?: string;
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
      <Card className="border-dashed border-muted-foreground/20 opacity-60">
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground italic">
            {canModerate ? '[deleted — moderators can restore]' : '[deleted]'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={depth > 0 ? 'ml-8' : ''}>
      <Card
        className={`relative overflow-hidden border-mist/50 shadow-sm hover:shadow-md transition-all duration-200 ${
          reply.is_accepted ? 'border-success/40 bg-success/[0.03]' : ''
        }`}
      >
        {/* Left accent */}
        <div
          className={`absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full ${
            reply.is_accepted ? 'bg-green-500' : 'bg-mist/40'
          }`}
        />
        <CardContent className="p-5 pl-6">
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <AuthorBlock
                author={reply.author as Profile}
                createdAt={reply.created_at}
                updatedAt={reply.updated_at}
                editCount={reply.edit_count}
                size="sm"
                meta={
                  reply.is_accepted ? (
                    <Badge className="bg-green-50 text-green-700 border-green-200 text-xs font-semibold">
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
                <div className="mt-2">
                  <RenderBody body={reply.body} />
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2 mt-3">
                <ReactionBar
                  targetType="reply"
                  targetId={reply.id}
                  userId={userId}
                  size="sm"
                />
                <div className="flex-1" />
                {onReply && !isReplying && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors"
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
                    className="h-7 text-xs rounded-lg hover:bg-amber-50 hover:text-amber-600 transition-colors"
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
                    className="h-7 text-xs text-red-500 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
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
                    className="h-7 text-xs rounded-lg hover:bg-green-50 hover:text-green-600 transition-colors"
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
        </CardContent>
      </Card>

      {children}
    </div>
  );
}
