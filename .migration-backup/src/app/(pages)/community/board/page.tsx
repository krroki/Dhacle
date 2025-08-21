'use client';

import { AlertCircle, ArrowLeft, Eye, Heart, Loader2, MessageSquare, Plus } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { apiGet, apiPost } from '@/lib/api-client';

interface Post {
  id: string;
  title: string;
  content: string;
  view_count: number;
  comment_count: number;
  like_count: number;
  isPinned: boolean;
  created_at: string;
  author: {
    username: string;
    avatar_url?: string;
  };
}

export default function CommunityBoardPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewPost, setShowNewPost] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiGet<{ posts: Post[]; totalPages: number }>(
        `/api/community/posts?category=board&page=${page}`
      );
      setPosts(data.posts || []);
      setTotalPages(data.totalPages || 1);
    } catch (_error) {
      setError('게시글을 불러오는데 실패했습니다');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleSubmit = async () => {
    if (!newPost.title.trim() || !newPost.content.trim()) {
      setError('제목과 내용을 모두 입력해주세요');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      await apiPost<{ id: string; title: string; content: string }>('/api/community/posts', {
        category: 'board',
        title: newPost.title,
        content: newPost.content,
      });

      setShowNewPost(false);
      setNewPost({ title: '', content: '' });
      fetchPosts();
    } catch (error) {
      setError(error instanceof Error ? error.message : '게시글 작성에 실패했습니다');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/community">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            커뮤니티로 돌아가기
          </Button>
        </Link>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">자유 게시판</h1>
          <p className="text-muted-foreground mt-1">크리에이터들이 자유롭게 소통하는 공간입니다</p>
        </div>
        <Button onClick={() => setShowNewPost(true)}>
          <Plus className="mr-2 h-4 w-4" />새 글 작성
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : posts.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">아직 게시글이 없습니다</h3>
            <p className="text-muted-foreground mb-4">첫 번째 게시글을 작성해보세요!</p>
            <Button onClick={() => setShowNewPost(true)}>
              <Plus className="mr-2 h-4 w-4" />첫 글 작성하기
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <Link key={post.id} href={`/community/board/${post.id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {post.isPinned && <Badge variant="secondary">공지</Badge>}
                        <h3 className="font-semibold text-lg">{post.title}</h3>
                      </div>
                      <p className="text-muted-foreground line-clamp-2 mb-3">{post.content}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{post.author?.username || '익명'}</span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {post.view_count}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          {post.comment_count}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          {post.like_count}
                        </span>
                        <span>{new Date(post.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            이전
          </Button>
          <span className="flex items-center px-4">
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            다음
          </Button>
        </div>
      )}

      {/* 새 글 작성 다이얼로그 */}
      <Dialog open={showNewPost} onOpenChange={setShowNewPost}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>새 글 작성</DialogTitle>
            <DialogDescription>자유 게시판에 새로운 글을 작성합니다</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Input
                placeholder="제목을 입력하세요"
                value={newPost.title}
                onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                disabled={submitting}
              />
            </div>
            <div>
              <Textarea
                placeholder="내용을 입력하세요"
                rows={10}
                value={newPost.content}
                onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                disabled={submitting}
                className="resize-none"
              />
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowNewPost(false)} disabled={submitting}>
                취소
              </Button>
              <Button onClick={handleSubmit} disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    작성 중...
                  </>
                ) : (
                  '작성하기'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
