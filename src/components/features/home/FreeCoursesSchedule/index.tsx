'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui';
import type { CourseSchedule } from '@/lib/dummy-data/home';
import { dummyCourseSchedules } from '@/lib/dummy-data/home';
import { SectionTitle } from '../shared/SectionTitle';

export function FreeCoursesSchedule() {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date(2025, 7, 1)); // 2025년 8월
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [hoveredDate, setHoveredDate] = useState<number | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const today = new Date();
  const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year;

  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
  const dayFullNames = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1));
    setSelectedDate(null);
    setHoveredDate(null);
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1));
    setSelectedDate(null);
    setHoveredDate(null);
  };

  // 현재 월의 일정만 필터링
  const monthSchedules = useMemo(() => {
    const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;
    return dummyCourseSchedules
      .filter((schedule) => schedule.date.startsWith(monthStr))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [year, month]);

  // 캘린더 날짜 생성
  const calendarDays = [];

  // Previous month days
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    calendarDays.push({
      day: daysInPrevMonth - i,
      isCurrentMonth: false,
      isToday: false,
    });
  }

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const hasEvents = monthSchedules.some((schedule) => schedule.date === dateStr);

    calendarDays.push({
      day,
      isCurrentMonth: true,
      isToday: isCurrentMonth && day === today.getDate(),
      hasEvents,
      date: dateStr,
    });
  }

  // Next month days to fill the grid
  const remainingDays = 42 - calendarDays.length;
  for (let day = 1; day <= remainingDays; day++) {
    calendarDays.push({
      day,
      isCurrentMonth: false,
      isToday: false,
    });
  }

  // 일정 목록을 위한 데이터 포맷팅
  const formatScheduleDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const day = date.getDate();
    const dayOfWeek = dayFullNames[date.getDay()];
    return { day: String(day).padStart(2, '0'), dayOfWeek, dayName: dayOfWeek.slice(0, 1) };
  };

  // 강의 상세 페이지로 이동
  const handleCourseClick = (courseId: string) => {
    router.push(`/courses/${courseId}`);
  };

  // 강의명 포맷팅 (길이 제한)
  const formatCourseName = (name: string) => {
    const match = name.match(/\[([^\]]+)\]\s*(.+?)(?:\s*-\s*.+)?$/);
    if (match) {
      const instructor = match[1];
      const title = match[2];
      return { instructor, title };
    }
    return { instructor: '', title: name };
  };

  return (
    <section className="py-16 bg-background">
      <div className="container-responsive">
        <SectionTitle
          title="무료 강의 일정"
          subtitle="라이브 강의와 특별 세미나 일정을 확인하세요"
          align="center"
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-10">
          {/* 캘린더 영역 - 데스크톱에서만 표시 */}
          <div className="hidden lg:block">
            <div className="bg-card rounded-lg border p-6">
              <div className="flex items-center justify-center mb-6">
                <Button variant="ghost" size="icon" onClick={prevMonth} className="mr-4">
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <h3 className="text-2xl font-bold">
                  {year}. {month + 1}
                </h3>
                <Button variant="ghost" size="icon" onClick={nextMonth} className="ml-4">
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-2">
                {dayNames.map((day, index) => (
                  <div
                    key={day}
                    className={`text-center text-sm font-medium py-2 ${
                      index === 0
                        ? 'text-red-500'
                        : index === 6
                          ? 'text-blue-500'
                          : 'text-muted-foreground'
                    }`}
                  >
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((dayInfo, index) => {
                  const isHovered =
                    hoveredDate === dayInfo.day && dayInfo.isCurrentMonth && dayInfo.hasEvents;
                  const isToday = dayInfo.isToday;

                  return (
                    <button
                      key={index}
                      onClick={() =>
                        dayInfo.isCurrentMonth && dayInfo.hasEvents && setSelectedDate(dayInfo.day)
                      }
                      disabled={!dayInfo.isCurrentMonth}
                      className={`
                        aspect-square flex items-center justify-center text-sm rounded-md
                        transition-all duration-200 relative
                        ${!dayInfo.isCurrentMonth ? 'text-muted-foreground/40 cursor-default' : ''}
                        ${isToday && !isHovered ? 'bg-primary text-primary-foreground font-bold' : ''}
                        ${isToday && isHovered ? 'bg-primary text-primary-foreground font-bold ring-2 ring-primary/50 scale-110' : ''}
                        ${!isToday && dayInfo.isCurrentMonth ? 'hover:bg-muted' : ''}
                        ${selectedDate === dayInfo.day && dayInfo.isCurrentMonth && !isToday ? 'ring-2 ring-primary bg-primary/10' : ''}
                        ${isHovered && !isToday ? 'bg-primary/20 scale-110' : ''}
                        ${index % 7 === 0 && dayInfo.isCurrentMonth && !isToday ? 'text-red-500' : ''}
                        ${index % 7 === 6 && dayInfo.isCurrentMonth && !isToday ? 'text-blue-500' : ''}
                      `}
                    >
                      {dayInfo.day}
                      {dayInfo.hasEvents && (
                        <span
                          className={`
                          absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full
                          ${isToday ? 'bg-white' : 'bg-primary'}
                          ${isHovered ? 'scale-150' : ''}
                          transition-all duration-200
                        `}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 일정 목록 영역 - 모바일에서는 전체 너비 */}
          <div className="space-y-3 lg:col-span-1">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold">
                {year}-{String(month + 1).padStart(2, '0')}
              </h4>
              <span className="text-sm text-muted-foreground">
                총 {monthSchedules.length}개 일정
              </span>
            </div>

            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
              {monthSchedules.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  이번 달에는 예정된 무료 강의가 없습니다.
                </div>
              ) : (
                monthSchedules.map((schedule) => {
                  const { day, dayOfWeek, dayName } = formatScheduleDate(schedule.date);
                  const isSelected = selectedDate === Number.parseInt(day);
                  const { instructor, title } = formatCourseName(schedule.courseName);

                  return (
                    <button
                      key={schedule.id}
                      onMouseEnter={() => setHoveredDate(Number.parseInt(day))}
                      onMouseLeave={() => setHoveredDate(null)}
                      onClick={() => handleCourseClick(schedule.courseId)}
                      className={`
                        w-full text-left px-4 py-3 rounded-lg border transition-all
                        hover:border-primary hover:bg-primary/10 hover:shadow-md
                        ${isSelected ? 'border-primary bg-primary/5' : 'border-border'}
                        ${hoveredDate === Number.parseInt(day) ? 'transform scale-[1.02]' : ''}
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="text-center min-w-[50px]">
                            <div className="text-2xl font-bold">{day}</div>
                            <div className="text-xs text-muted-foreground">({dayName})</div>
                          </div>
                          <div className="flex-1">
                            <div className="font-medium line-clamp-1">
                              <span className="text-primary font-bold">[{instructor}]</span>
                              <span className="ml-1">{title}</span>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {schedule.time}
                              {schedule.isLive && (
                                <span className="ml-2 text-red-500 font-medium">LIVE</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <ChevronRight
                          className={`
                          h-4 w-4 text-muted-foreground transition-transform
                          ${hoveredDate === Number.parseInt(day) ? 'translate-x-1' : ''}
                        `}
                        />
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
