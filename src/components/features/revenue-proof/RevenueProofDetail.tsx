'use client';

import { useMutation } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import DOMPurify from 'dompurify';
import {
  AlertTriangle,
  Calendar,
  Check,
  DollarSign,
  Edit,
  Heart,
  Instagram,
  MessageCircle,
  Share2,
  Trash2,
  Youtube,
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import {
  createComment,
  deleteRevenueProof,
  reportProof,
  toggleLike,
  updateRevenueProof,
} from '@/lib/api/revenue-proof';
import type { ProofComment, RevenueProofWithUser } from '@/types';

interface RevenueProofDetailProps {
  initialData: RevenueProofWithUser & { isLiked: boolean; currentUserId?: string };
  currentUserId?: string;
}

export function RevenueProofDetail({ initialData, currentUserId }: RevenueProofDetailProps) {
  const router = useRouter();
  const [proof, set_proof] = useState(initialData);
  const [is_liked, set_is_liked] = useState(initialData.isLiked);
  const [comment_content, set_comment_content] = useState('');
  const [comments, set_comments] = useState<ProofComment[]>(initialData.comments || []);
  const [show_report_dialog, set_show_report_dialog] = useState(false);
  const [show_delete_dialog, set_show_delete_dialog] = useState(false);
  const [show_edit_dialog, set_show_edit_dialog] = useState(false);
  const [report_reason, set_report_reason] = useState<string>('');
  const [report_details, set_report_details] = useState('');
  const [report_acknowledged, set_report_acknowledged] = useState(false);
  const [edit_title, set_edit_title] = useState(proof.title);
  const [edit_content, set_edit_content] = useState(proof.content);
  const [copied, set_copied] = useState(false);

  // 플랫폼 아이콘 매핑
  const platform_icons: Record<string, React.ReactElement> = {
    youtube: <Youtube className="h-5 w-5" />,
    instagram: <Instagram className="h-5 w-5" />,
    tiktok: <DollarSign className="h-5 w-5" />, // TikTok 아이콘 대체
  };

  const platform_colors: Record<string, string> = {
    youtube: 'bg-red-500',
    instagram: 'bg-gradient-to-tr from-purple-500 to-pink-500',
    tiktok: 'bg-black',
  };

  // 좋아요 토글
  const like_mutation = useMutation({
    mutationFn: () => toggleLike(proof.id),
    onSuccess: () => {
      set_is_liked(!is_liked);
      set_proof((prev) => ({
        ...prev,
        likes_count: is_liked ? (prev.likes_count ?? 0) - 1 : (prev.likes_count ?? 0) + 1,
      }));
    },
    onError: () => {
      toast.error('좋아요 처리 중 오류가 발생했습니다.');
    },
  });

  // 댓글 작성
  const comment_mutation = useMutation({
    mutationFn: (content: string) => createComment(proof.id, content),
    onSuccess: (data) => {
      set_comments([data, ...comments]);
      set_comment_content('');
      set_proof((prev) => ({
        ...prev,
        comments_count: (prev.comments_count ?? 0) + 1,
      }));
      toast.success('댓글이 작성되었습니다.');
    },
    onError: () => {
      toast.error('댓글 작성 중 오류가 발생했습니다.');
    },
  });

  // 신고하기
  const report_mutation = useMutation({
    mutationFn: () =>
      reportProof(proof.id, {
        reason: report_reason,
        details: report_details,
        acknowledged: report_acknowledged,
      }),
    onSuccess: () => {
      set_show_report_dialog(false);
      toast.success('신고가 접수되었습니다.');
      set_report_reason('');
      set_report_details('');
      set_report_acknowledged(false);
    },
    onError: () => {
      toast.error('신고 처리 중 오류가 발생했습니다.');
    },
  });

  // 삭제하기
  const delete_mutation = useMutation({
    mutationFn: () => deleteRevenueProof(proof.id),
    onSuccess: () => {
      toast.success('수익 인증이 삭제되었습니다.');
      router.push('/revenue-proof');
    },
    onError: () => {
      toast.error('삭제 중 오류가 발생했습니다.');
    },
  });

  // 수정하기
  const edit_mutation = useMutation({
    mutationFn: () =>
      updateRevenueProof(proof.id, {
        title: edit_title,
        content: edit_content,
      }),
    onSuccess: (_data) => {
      set_proof((prev) => ({
        ...prev,
        title: edit_title,
        content: edit_content,
      }));
      set_show_edit_dialog(false);
      toast.success('수익 인증이 수정되었습니다.');
    },
    onError: () => {
      toast.error('수정 중 오류가 발생했습니다. 24시간이 지났거나 권한이 없습니다.');
    },
  });

  // URL 복사
  const handle_share = () => {
    navigator.clipboard.writeText(window.location.href);
    set_copied(true);
    toast.success('링크가 복사되었습니다.');
    setTimeout(() => set_copied(false), 2000);
  };

  // 24시간 내 수정 가능 여부 체크
  const can_edit = () => {
    if (!currentUserId || proof.user_id !== currentUserId) {
      return false;
    }
    const created_at = new Date(proof.created_at ?? new Date().toISOString());
    const now = new Date();
    const hours_diff = (now.getTime() - created_at.getTime()) / (1000 * 60 * 60);
    return hours_diff <= 24;
  };

  // 작성자 여부 확인
  const is_owner = currentUserId === proof.user_id;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 메인 컨텐츠 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 상세 정보 카드 */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <h1 className="text-2xl font-bold">{proof.title}</h1>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={proof.user?.avatar_url ?? undefined} />
                        <AvatarFallback>{proof.user?.username?.[0]?.toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <span>{proof.user?.username}</span>
                    </div>
                    <Separator orientation="vertical" className="h-4" />
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {formatDistanceToNow(
                          new Date(proof.created_at ?? new Date().toISOString()),
                          {
                            addSuffix: true,
                            locale: ko,
                          }
                        )}
                      </span>
                    </div>
                  </div>
                </div>
                <Badge className={`${platform_colors[proof.platform] || 'bg-gray-500'} text-white`}>
                  <span className="flex items-center gap-1">
                    {platform_icons[proof.platform] || platform_icons.youtube}
                    {(proof.platform ?? 'unknown').charAt(0).toUpperCase() +
                      (proof.platform ?? 'unknown').slice(1)}
                  </span>
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* 수익 금액 */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 p-6 rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">인증 수익</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  ₩{proof.amount.toLocaleString()}
                </p>
              </div>

              {/* 스크린샷 이미지 */}
              <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                <Image
                  src={proof.screenshot_url}
                  alt="수익 인증 스크린샷"
                  fill={true}
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 50vw"
                  priority={true}
                />
                {/* 서명 오버레이 */}
                {proof.signature_data && (
                  <div className="absolute bottom-4 right-4 bg-white/90 dark:bg-black/90 p-2 rounded">
                    <Image
                      src={proof.signature_data}
                      alt="서명"
                      width={60}
                      height={48}
                      className="h-12 w-auto object-contain"
                    />
                  </div>
                )}
              </div>

              {/* 상세 내용 */}
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <h3 className="text-lg font-semibold mb-3">수익 달성 과정</h3>
                <div
                  className="text-muted-foreground"
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(proof.content),
                  }}
                />
              </div>
            </CardContent>

            <CardFooter className="flex justify-between items-center">
              {/* 좋아요, 댓글 카운트 */}
              <div className="flex items-center gap-4">
                <Button
                  variant={is_liked ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => like_mutation.mutate()}
                  disabled={!currentUserId || like_mutation.isPending}
                >
                  <Heart className={`h-4 w-4 mr-1 ${is_liked ? 'fill-current' : ''}`} />
                  {proof.likes_count}
                </Button>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <MessageCircle className="h-4 w-4" />
                  <span className="text-sm">{proof.comments_count}</span>
                </div>
              </div>

              {/* 액션 버튼들 */}
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handle_share}>
                  {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
                </Button>

                {is_owner && can_edit() && (
                  <Button variant="outline" size="sm" onClick={() => set_show_edit_dialog(true)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                )}

                {is_owner && (
                  <Button variant="outline" size="sm" onClick={() => set_show_delete_dialog(true)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}

                {!is_owner && currentUserId && (
                  <Button variant="outline" size="sm" onClick={() => set_show_report_dialog(true)}>
                    <AlertTriangle className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardFooter>
          </Card>

          {/* 댓글 섹션 */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">댓글 {comments.length}개</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 댓글 작성 */}
              {currentUserId ? (
                <div className="space-y-2">
                  <Textarea
                    placeholder="댓글을 작성해주세요..."
                    value={comment_content}
                    onChange={(e) => set_comment_content(e.target.value)}
                    rows={3}
                    maxLength={500}
                  />
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">
                      {comment_content.length}/500
                    </span>
                    <Button
                      size="sm"
                      onClick={() => comment_mutation.mutate(comment_content)}
                      disabled={!comment_content.trim() || comment_mutation.isPending}
                    >
                      댓글 작성
                    </Button>
                  </div>
                </div>
              ) : (
                <Alert>
                  <AlertDescription>댓글을 작성하려면 로그인이 필요합니다.</AlertDescription>
                </Alert>
              )}

              <Separator />

              {/* 댓글 목록 */}
              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  {comments.length > 0 ? (
                    comments.map((comment) => (
                      <div key={comment.id} className="flex gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={comment.user?.avatar_url ?? undefined} />
                          <AvatarFallback>
                            {comment.user?.username?.[0]?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{comment.user?.username}</span>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(
                                new Date(comment.created_at ?? new Date().toISOString()),
                                {
                                  addSuffix: true,
                                  locale: ko,
                                }
                              )}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{comment.content}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      아직 댓글이 없습니다. 첫 댓글을 작성해보세요!
                    </p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* 사이드바 */}
        <div className="space-y-6">
          {/* 작성자 정보 */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">작성자 정보</h3>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={proof.user?.avatar_url ?? undefined} />
                  <AvatarFallback>{proof.user?.username?.[0]?.toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{proof.user?.username}</p>
                  <p className="text-sm text-muted-foreground">크리에이터</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 관련 통계 */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">인증 통계</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">좋아요</span>
                  <span className="font-medium">{proof.likes_count}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">댓글</span>
                  <span className="font-medium">{proof.comments_count}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">조회수</span>
                  <span className="font-medium">-</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 수정 다이얼로그 */}
      <Dialog open={show_edit_dialog} onOpenChange={set_show_edit_dialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>수익 인증 수정</DialogTitle>
            <DialogDescription>작성 후 24시간 이내에만 수정 가능합니다.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-title">제목</Label>
              <input
                id="edit-title"
                type="text"
                value={edit_title}
                onChange={(e) => set_edit_title(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                maxLength={100}
              />
            </div>
            <div>
              <Label htmlFor="edit-content">내용</Label>
              <Textarea
                id="edit-content"
                value={edit_content}
                onChange={(e) => set_edit_content(e.target.value)}
                rows={10}
                maxLength={10000}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => set_show_edit_dialog(false)}>
              취소
            </Button>
            <Button onClick={() => edit_mutation.mutate()} disabled={edit_mutation.isPending}>
              수정하기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 삭제 확인 다이얼로그 */}
      <AlertDialog open={show_delete_dialog} onOpenChange={set_show_delete_dialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>정말 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              이 작업은 되돌릴 수 없습니다. 수익 인증과 관련된 모든 데이터가 삭제됩니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => delete_mutation.mutate()}
              className="bg-red-600 hover:bg-red-700"
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 신고 다이얼로그 */}
      <Dialog open={show_report_dialog} onOpenChange={set_show_report_dialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              수익 인증 신고
            </DialogTitle>
            <DialogDescription>허위 신고 시 제재를 받을 수 있습니다.</DialogDescription>
          </DialogHeader>

          <Alert className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              신고 기능을 악용할 경우 계정 이용이 제한될 수 있습니다. 신중하게 신고해주세요.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div>
              <Label>신고 사유</Label>
              <RadioGroup value={report_reason} onValueChange={set_report_reason}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="fake" id="fake" />
                  <Label htmlFor="fake">허위/조작된 인증</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="spam" id="spam" />
                  <Label htmlFor="spam">스팸/광고</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="inappropriate" id="inappropriate" />
                  <Label htmlFor="inappropriate">부적절한 내용</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="copyright" id="copyright" />
                  <Label htmlFor="copyright">저작권 침해</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="other" id="other" />
                  <Label htmlFor="other">기타</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label htmlFor="details">상세 내용 (선택)</Label>
              <Textarea
                id="details"
                placeholder="신고 사유를 자세히 설명해주세요..."
                value={report_details}
                onChange={(e) => set_report_details(e.target.value)}
                rows={3}
                maxLength={500}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="acknowledge"
                checked={report_acknowledged}
                onCheckedChange={(checked) => set_report_acknowledged(checked as boolean)}
              />
              <Label htmlFor="acknowledge" className="text-sm">
                허위 신고 시 제재 조치를 받을 수 있음을 확인했습니다.
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => set_show_report_dialog(false)}>
              취소
            </Button>
            <Button
              onClick={() => report_mutation.mutate()}
              disabled={!report_reason || !report_acknowledged || report_mutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              신고하기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
