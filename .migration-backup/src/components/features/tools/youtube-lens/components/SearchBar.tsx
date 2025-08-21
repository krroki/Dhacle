'use client';

import { Clock, Filter, Loader2, Search, TrendingUp, X } from 'lucide-react';
import { type KeyboardEvent, useCallback, useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useYouTubeLensStore } from '@/store/youtube-lens';
import type { YouTubeSearchFilters } from '@/types/youtube';

interface SearchBarProps {
  onSearch: (query: string, filters: YouTubeSearchFilters) => Promise<void>;
  isLoading?: boolean;
  disabled?: boolean;
}

// 추천 검색어
const SUGGESTED_QUERIES = [
  '쇼츠 만들기',
  'YouTube 알고리즘',
  '썸네일 디자인',
  '편집 팁',
  '수익화 방법',
  '조회수 늘리기',
];

export function SearchBar({ onSearch, isLoading = false, disabled = false }: SearchBarProps) {
  const {
    searchQuery,
    searchFilters,
    searchHistory,
    setSearchQuery,
    setSearchFilters,
    addToSearchHistory,
  } = useYouTubeLensStore();

  const [showHistory, setShowHistory] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // 검색 실행
  const handleSearch = useCallback(async () => {
    const trimmedQuery = searchQuery.trim();
    if (!trimmedQuery || isLoading || disabled) {
      return;
    }

    // 검색 기록에 추가
    addToSearchHistory(trimmedQuery);

    // 검색 실행
    await onSearch(trimmedQuery, {
      ...searchFilters,
      query: trimmedQuery,
    });
  }, [searchQuery, searchFilters, isLoading, disabled, onSearch, addToSearchHistory]);

  // 엔터키 처리
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  };

  // 검색어 선택
  const selectQuery = (query: string) => {
    setSearchQuery(query);
    setShowHistory(false);
    inputRef.current?.focus();
  };

  // 필터 리셋
  const resetFilters = () => {
    setSearchFilters({
      query: '',
      order: 'relevance',
      maxResults: 50,
      videoDuration: 'short',
    });
  };

  // 활성 필터 개수
  const activeFilterCount = [
    searchFilters.order !== 'relevance',
    searchFilters.videoDuration !== 'short',
    searchFilters.videoDefinition === 'high',
    searchFilters.publishedAfter,
    searchFilters.publishedBefore,
  ].filter(Boolean).length;

  return (
    <div className="space-y-4">
      {/* 검색 입력 영역 */}
      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              type="text"
              placeholder="YouTube 영상 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setShowHistory(true)}
              onBlur={() => setTimeout(() => setShowHistory(false), 200)}
              disabled={disabled}
              className="pl-10 pr-10"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* 필터 버튼 */}
          <Popover open={showFilters} onOpenChange={setShowFilters}>
            <PopoverTrigger asChild={true}>
              <Button variant="outline" size="icon" className="relative">
                <Filter className="h-4 w-4" />
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-[10px] text-primary-foreground flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">검색 필터</h4>
                  {activeFilterCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={resetFilters}
                      className="h-auto p-1 text-xs"
                    >
                      초기화
                    </Button>
                  )}
                </div>

                {/* 정렬 순서 */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">정렬</label>
                  <Select
                    value={searchFilters.order}
                    onValueChange={(value) =>
                      setSearchFilters({ order: value as YouTubeSearchFilters['order'] })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="relevance">관련성</SelectItem>
                      <SelectItem value="date">최신순</SelectItem>
                      <SelectItem value="viewCount">조회수</SelectItem>
                      <SelectItem value="rating">평점순</SelectItem>
                      <SelectItem value="title">제목순</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 영상 길이 */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">영상 길이</label>
                  <Select
                    value={searchFilters.videoDuration}
                    onValueChange={(value) =>
                      setSearchFilters({
                        videoDuration: value as YouTubeSearchFilters['videoDuration'],
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="short">4분 미만</SelectItem>
                      <SelectItem value="medium">4-20분</SelectItem>
                      <SelectItem value="long">20분 이상</SelectItem>
                      <SelectItem value="any">모든 길이</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 화질 */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">화질</label>
                  <Select
                    value={searchFilters.videoDefinition || 'any'}
                    onValueChange={(value) =>
                      setSearchFilters({
                        videoDefinition:
                          value === 'any'
                            ? undefined
                            : (value as YouTubeSearchFilters['videoDefinition']),
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">모든 화질</SelectItem>
                      <SelectItem value="high">HD (고화질)</SelectItem>
                      <SelectItem value="standard">SD (표준화질)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 결과 개수 */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">결과 개수</label>
                  <Select
                    value={searchFilters.maxResults?.toString() || '50'}
                    onValueChange={(value) =>
                      setSearchFilters({ maxResults: Number.parseInt(value, 10) })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10개</SelectItem>
                      <SelectItem value="25">25개</SelectItem>
                      <SelectItem value="50">50개</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* 검색 버튼 */}
          <Button
            onClick={handleSearch}
            disabled={!searchQuery.trim() || isLoading || disabled}
            className="min-w-[100px]"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                검색 중...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                검색
              </>
            )}
          </Button>
        </div>

        {/* 검색 기록 & 추천 드롭다운 */}
        {showHistory && !isLoading && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-lg shadow-lg z-50">
            {searchHistory.length > 0 && (
              <div className="p-2 border-b">
                <div className="flex items-center gap-2 px-2 py-1 text-sm text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  최근 검색
                </div>
                <div className="space-y-1">
                  {searchHistory.slice(0, 5).map((query, index) => (
                    <button
                      key={index}
                      onClick={() => selectQuery(query)}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-accent rounded-md transition-colors"
                    >
                      {query}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="p-2">
              <div className="flex items-center gap-2 px-2 py-1 text-sm text-muted-foreground">
                <TrendingUp className="h-3 w-3" />
                추천 검색어
              </div>
              <div className="space-y-1">
                {SUGGESTED_QUERIES.map((query) => (
                  <button
                    key={query}
                    onClick={() => selectQuery(query)}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-accent rounded-md transition-colors"
                  >
                    {query}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 활성 필터 표시 */}
      {activeFilterCount > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">필터:</span>
          {searchFilters.order !== 'relevance' && (
            <Badge variant="secondary" className="gap-1">
              정렬:{' '}
              {searchFilters.order === 'date'
                ? '최신순'
                : searchFilters.order === 'viewCount'
                  ? '조회수'
                  : searchFilters.order === 'rating'
                    ? '평점순'
                    : '제목순'}
              <button
                onClick={() => setSearchFilters({ order: 'relevance' })}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {searchFilters.videoDuration !== 'short' && (
            <Badge variant="secondary" className="gap-1">
              길이:{' '}
              {searchFilters.videoDuration === 'medium'
                ? '4-20분'
                : searchFilters.videoDuration === 'long'
                  ? '20분+'
                  : '모든 길이'}
              <button
                onClick={() => setSearchFilters({ videoDuration: 'short' })}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {searchFilters.videoDefinition === 'high' && (
            <Badge variant="secondary" className="gap-1">
              HD 화질
              <button
                onClick={() => setSearchFilters({ videoDefinition: undefined })}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
