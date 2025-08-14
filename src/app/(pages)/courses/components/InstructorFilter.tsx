'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import type { CourseFilters } from '@/types/course';

interface InstructorFilterProps {
  instructors: string[];
  onFilterChange?: (filters: CourseFilters) => void;
}

export function InstructorFilter({ instructors, onFilterChange }: InstructorFilterProps) {
  const [filters, setFilters] = useState<CourseFilters>({});
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleFilterChange = (newFilters: CourseFilters) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);
    onFilterChange?.(updated);
  };

  const handleSearch = () => {
    handleFilterChange({ search: searchQuery });
  };

  const clearFilters = () => {
    setFilters({});
    setSearchQuery('');
    onFilterChange?.({});
  };

  const activeFilterCount = Object.keys(filters).filter(key => 
    filters[key as keyof CourseFilters] !== undefined
  ).length;

  return (
    <div className="space-y-4 mb-8">
      {/* 검색바 */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            type="text"
            placeholder="강의 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-10"
          />
        </div>
        <Button onClick={handleSearch}>검색</Button>
        <Button
          variant="outline"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="gap-2"
        >
          <SlidersHorizontal className="w-4 h-4" />
          필터
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-1">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* 강사 선택 */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={!filters.instructor ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleFilterChange({ instructor: undefined })}
        >
          전체 강사
        </Button>
        {instructors.map((instructor) => (
          <Button
            key={instructor}
            variant={filters.instructor === instructor ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleFilterChange({ instructor })}
          >
            {instructor}
          </Button>
        ))}
      </div>

      {/* 고급 필터 */}
      {showAdvanced && (
        <div className="border rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">상세 필터</h3>
            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="gap-1"
              >
                <X className="w-3 h-3" />
                초기화
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 가격 필터 */}
            <div className="space-y-2">
              <Label>가격</Label>
              <div className="flex gap-2">
                <Button
                  variant={filters.is_free === true ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleFilterChange({ is_free: true })}
                >
                  무료
                </Button>
                <Button
                  variant={filters.is_free === false ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleFilterChange({ is_free: false })}
                >
                  유료
                </Button>
                <Button
                  variant={filters.is_free === undefined ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleFilterChange({ is_free: undefined })}
                >
                  전체
                </Button>
              </div>
            </div>

            {/* 평점 필터 */}
            <div className="space-y-2">
              <Label>최소 평점</Label>
              <Select
                value={filters.rating?.toString()}
                onValueChange={(value) => 
                  handleFilterChange({ rating: value ? parseFloat(value) : undefined })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">전체</SelectItem>
                  <SelectItem value="4.5">4.5 이상</SelectItem>
                  <SelectItem value="4.0">4.0 이상</SelectItem>
                  <SelectItem value="3.5">3.5 이상</SelectItem>
                  <SelectItem value="3.0">3.0 이상</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 상태 필터 */}
            <div className="space-y-2">
              <Label>강의 상태</Label>
              <Select
                value={filters.status}
                onValueChange={(value) => 
                  handleFilterChange({ status: value as 'upcoming' | 'active' | 'completed' | undefined })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">전체</SelectItem>
                  <SelectItem value="active">진행중</SelectItem>
                  <SelectItem value="upcoming">예정</SelectItem>
                  <SelectItem value="completed">종료</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}