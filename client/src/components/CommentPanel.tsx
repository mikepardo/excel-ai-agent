import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Check, X, Trash2, Edit2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/_core/hooks/useAuth';

interface CommentPanelProps {
  spreadsheetId: number;
  cellRef?: string;
}

export function CommentPanel({ spreadsheetId, cellRef }: CommentPanelProps) {
  const { user } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');

  const { data: comments, refetch } = trpc.comment.list.useQuery(
    { spreadsheetId },
    { enabled: !!spreadsheetId }
  );

  const createMutation = trpc.comment.create.useMutation({
    onSuccess: () => {
      toast.success('Comment added');
      setNewComment('');
      refetch();
    },
  });

  const updateMutation = trpc.comment.update.useMutation({
    onSuccess: () => {
      toast.success('Comment updated');
      setEditingId(null);
      refetch();
    },
  });

  const resolveMutation = trpc.comment.resolve.useMutation({
    onSuccess: () => {
      toast.success('Comment status updated');
      refetch();
    },
  });

  const deleteMutation = trpc.comment.delete.useMutation({
    onSuccess: () => {
      toast.success('Comment deleted');
      refetch();
    },
  });

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    createMutation.mutate({
      spreadsheetId,
      cellRef: cellRef || 'General',
      content: newComment,
    });
  };

  const handleUpdateComment = (id: number) => {
    if (!editContent.trim()) return;

    updateMutation.mutate({
      id,
      content: editContent,
    });
  };

  const filteredComments = cellRef
    ? comments?.filter((c) => c.cellRef === cellRef)
    : comments;

  const unresolvedCount = filteredComments?.filter((c) => c.resolved === 0).length || 0;

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Comments
          </h3>
          {unresolvedCount > 0 && (
            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
              {unresolvedCount} unresolved
            </Badge>
          )}
        </div>
        {cellRef && (
          <p className="text-xs text-gray-600">
            Showing comments for cell <span className="font-mono font-semibold">{cellRef}</span>
          </p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredComments && filteredComments.length > 0 ? (
          filteredComments.map((comment) => (
            <Card
              key={comment.id}
              className={comment.resolved ? 'opacity-60' : ''}
            >
              <CardContent className="p-3">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-semibold text-emerald-600">
                        {comment.cellRef}
                      </span>
                      {comment.resolved === 1 && (
                        <Badge variant="outline" className="text-xs">
                          <Check className="h-3 w-3 mr-1" />
                          Resolved
                        </Badge>
                      )}
                    </div>
                    {editingId === comment.id ? (
                      <div className="space-y-2">
                        <Textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="text-sm"
                          rows={2}
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleUpdateComment(comment.id)}
                            disabled={updateMutation.isPending}
                          >
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingId(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-700">{comment.content}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t">
                  <span className="text-xs text-gray-500">
                    {new Date(comment.createdAt).toLocaleString()}
                  </span>
                  {comment.userId === user?.id && editingId !== comment.id && (
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2"
                        onClick={() => {
                          setEditingId(comment.id);
                          setEditContent(comment.content);
                        }}
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2"
                        onClick={() =>
                          resolveMutation.mutate({
                            id: comment.id,
                            resolved: comment.resolved === 0,
                          })
                        }
                      >
                        {comment.resolved === 0 ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          <X className="h-3 w-3" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-red-600 hover:text-red-700"
                        onClick={() => deleteMutation.mutate({ id: comment.id })}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center text-gray-500 text-sm py-8">
            No comments yet. Add one below!
          </div>
        )}
      </div>

      <div className="p-4 border-t bg-gray-50">
        <Textarea
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="mb-2"
          rows={3}
        />
        <Button
          onClick={handleAddComment}
          disabled={!newComment.trim() || createMutation.isPending}
          className="w-full"
        >
          Add Comment
        </Button>
      </div>
    </div>
  );
}
