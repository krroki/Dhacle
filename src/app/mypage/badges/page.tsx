import type { SupabaseClient } from '@supabase/supabase-js';
import {
  Award,
  BookOpen,
  CheckCircle,
  Clock,
  Star,
  Target,
  TrendingUp,
  Trophy,
  Users,
  Zap,
} from 'lucide-react';
import { redirect } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { createSupabaseServerClient } from '@/lib/supabase/server-client';
import type { Database } from '@/types/database';

// 뱃지 아이콘 매핑
const badgeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  firstCourse: BookOpen,
  fiveCourses: Target,
  tenCourses: Trophy,
  firstRevenue: TrendingUp,
  communityContributor: Users,
  fastLearner: Zap,
  dedication: Clock,
  achiever: Star,
  master: Award,
  default: Award,
};

// 뱃지 색상 매핑
const badgeColors: { [key: string]: string } = {
  bronze: 'bg-orange-100 text-orange-700 border-orange-300',
  silver: 'bg-gray-100 text-gray-700 border-gray-300',
  gold: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  platinum: 'bg-purple-100 text-purple-700 border-purple-300',
  default: 'bg-blue-100 text-blue-700 border-blue-300',
};

interface UserBadge {
  id: string;
  user_id: string;
  badgeType: string;
  badgeLevel: string;
  earnedAt: string;
  title: string;
  description: string;
}

export default async function MyBadgesPage() {
  const supabase = (await createSupabaseServerClient()) as SupabaseClient<Database>;
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // 사용자의 뱃지 가져오기
  const { data: userBadges } = await supabase
    .from('badges')
    .select('*')
    .eq('user_id', user.id)
    .order('earnedAt', { ascending: false });

  const badges = userBadges || [];

  // 획득 가능한 뱃지 목록 (더미 데이터)
  const availableBadges = [
    {
      type: 'firstCourse',
      title: '첫 강의 수강',
      description: '첫 번째 강의를 수강했습니다',
      condition: '강의 1개 수강',
      level: 'bronze',
    },
    {
      type: 'fiveCourses',
      title: '열정적인 학습자',
      description: '5개의 강의를 수강했습니다',
      condition: '강의 5개 수강',
      level: 'silver',
    },
    {
      type: 'tenCourses',
      title: '지식 탐험가',
      description: '10개의 강의를 수강했습니다',
      condition: '강의 10개 수강',
      level: 'gold',
    },
    {
      type: 'firstRevenue',
      title: '첫 수익 달성',
      description: '첫 수익을 인증했습니다',
      condition: '수익 인증 1회',
      level: 'bronze',
    },
    {
      type: 'communityContributor',
      title: '커뮤니티 기여자',
      description: '커뮤니티 활동에 적극 참여했습니다',
      condition: '게시글 10개 작성',
      level: 'silver',
    },
    {
      type: 'fastLearner',
      title: '빠른 학습자',
      description: '일주일 내 강의를 완료했습니다',
      condition: '7일 내 강의 완료',
      level: 'gold',
    },
    {
      type: 'dedication',
      title: '꾸준한 학습',
      description: '30일 연속 학습했습니다',
      condition: '30일 연속 접속',
      level: 'platinum',
    },
    {
      type: 'achiever',
      title: '성취자',
      description: '모든 과제를 완료했습니다',
      condition: '과제 완료율 100%',
      level: 'gold',
    },
    {
      type: 'master',
      title: '마스터',
      description: '전문가 레벨에 도달했습니다',
      condition: '전문가 인증',
      level: 'platinum',
    },
  ];

  // 획득한 뱃지 타입 목록
  const earnedBadgeTypes = new Set(badges.map((b: UserBadge) => b.badgeType));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">획득 뱃지</h2>
        <p className="mt-1 text-gray-600">학습 성과와 활동으로 획득한 뱃지를 확인하세요</p>
      </div>

      {/* 뱃지 통계 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">전체 뱃지</p>
                <p className="text-2xl font-bold mt-1">{badges.length}</p>
              </div>
              <Award className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">획득률</p>
                <p className="text-2xl font-bold mt-1">
                  {Math.round((badges.length / availableBadges.length) * 100)}%
                </p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">최근 획득</p>
                <p className="text-sm font-medium mt-1">
                  {badges.length > 0
                    ? new Date(badges[0].earnedAt).toLocaleDateString('ko-KR')
                    : '-'}
                </p>
              </div>
              <Star className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 획득한 뱃지 */}
      {badges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>획득한 뱃지</CardTitle>
            <CardDescription>열심히 학습하고 활동하여 획득한 뱃지입니다</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {badges.map((badge: UserBadge) => {
                const Icon = badgeIcons[badge.badgeType] || badgeIcons.default;
                const colorClass = badgeColors[badge.badgeLevel] || badgeColors.default;

                return (
                  <div
                    key={badge.id}
                    className={`p-4 rounded-lg border-2 ${colorClass} bg-opacity-20`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-3 rounded-full ${colorClass}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{badge.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{badge.description}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(badge.earnedAt).toLocaleDateString('ko-KR')} 획득
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 획득 가능한 뱃지 */}
      <Card>
        <CardHeader>
          <CardTitle>획득 가능한 뱃지</CardTitle>
          <CardDescription>조건을 달성하여 새로운 뱃지를 획득해보세요</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableBadges.map((badge) => {
              const Icon = badgeIcons[badge.type] || badgeIcons.default;
              const colorClass = badgeColors[badge.level] || badgeColors.default;
              const isEarned = earnedBadgeTypes.has(badge.type);

              return (
                <div
                  key={badge.type}
                  className={`p-4 rounded-lg border-2 ${
                    isEarned
                      ? `${colorClass} bg-opacity-20`
                      : 'border-gray-200 bg-gray-50 opacity-60'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-3 rounded-full ${
                        isEarned ? colorClass : 'bg-gray-200 text-gray-400'
                      }`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4
                          className={`font-semibold ${
                            isEarned ? 'text-gray-900' : 'text-gray-600'
                          }`}
                        >
                          {badge.title}
                        </h4>
                        {isEarned && <CheckCircle className="h-4 w-4 text-green-600" />}
                      </div>
                      <p className={`text-sm mt-1 ${isEarned ? 'text-gray-600' : 'text-gray-500'}`}>
                        {badge.description}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">조건: {badge.condition}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
