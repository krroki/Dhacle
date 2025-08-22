'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui';
import { dummyCourseSchedules } from '@/lib/dummy-data/home';
import { SectionTitle } from '../shared/SectionTitle';

export function FreeCoursesSchedule() {
  const router = useRouter();
  const [current_date, set_current_date] = useState(new Date(2025, 7, 1)); // 2025년 8월
  const [selected_date, set_selected_date] = useState<number | null>(null);
  const [hovered_date, set_hovered_date] = useState<number | null>(null);

  const year = current_date.getFullYear();
  const month = current_date.getMonth();

  const first_day_of_month = new Date(year, month, 1).getDay();
  const days_in_month = new Date(year, month + 1, 0).getDate();
  const days_in_prev_month = new Date(year, month, 0).getDate();

  const today = new Date();
  const is_current_month = today.getMonth() === month && today.getFullYear() === year;

  const day_names = ['일', '월', '화', '수', '목', '금', '토'];
  const day_full_names = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];

  const prev_month = () => {
    set_current_date(new Date(year, month - 1));
    set_selected_date(null);
    set_hovered_date(null);
  };

  const next_month = () => {
    set_current_date(new Date(year, month + 1));
    set_selected_date(null);
    set_hovered_date(null);
  };

  // 현재 월의 일정만 필터링
  const month_schedules = useMemo(() => {
    const month_str = `${year}-${String(month + 1).padStart(2, '0')}`;
    return dummyCourseSchedules
      .filter((schedule) => schedule.date.startsWith(month_str))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [year, month]);

  // 캘린더 날짜 생성
  const calendar_days = [];

  // Previous month days
  for (let i = first_day_of_month - 1; i >= 0; i--) {
    calendar_days.push({
      day: days_in_prev_month - i,
      isCurrentMonth: false,
      isToday: false,
    });
  }

  // Current month days
  for (let day = 1; day <= days_in_month; day++) {
    const date_str = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const has_events = month_schedules.some((schedule) => schedule.date === date_str);

    calendar_days.push({
      day,
      isCurrentMonth: true,
      isToday: is_current_month && day === today.getDate(),
      hasEvents: has_events,
      date: date_str,
    });
  }

  // Next month days to fill the grid
  const remaining_days = 42 - calendar_days.length;
  for (let day = 1; day <= remaining_days; day++) {
    calendar_days.push({
      day,
      isCurrentMonth: false,
      isToday: false,
    });
  }

  // 일정 목록을 위한 데이터 포맷팅
  const format_schedule_date = (date_str: string) => {
    const date = new Date(date_str);
    const day = date.getDate();
    const _day_of_week = day_full_names[date.getDay()] ?? '월요일';
    return {
      day: String(day).padStart(2, '0'),
      dayOfWeek: _day_of_week,
      dayName: _day_of_week.slice(0, 1),
    };
  };

  // 강의 상세 페이지로 이동
  const handle_course_click = (course_id: string) => {
    router.push(`/courses/${course_id}`);
  };

  // 강의명 포맷팅 (길이 제한)
  const format_course_name = (name: string) => {
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
                <Button variant="ghost" size="icon" onClick={prev_month} className="mr-4">
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <h3 className="text-2xl font-bold">
                  {year}. {month + 1}
                </h3>
                <Button variant="ghost" size="icon" onClick={next_month} className="ml-4">
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-2">
                {day_names.map((day, index) => (
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
                {calendar_days.map((day_info, index) => {
                  const is_hovered =
                    hovered_date === day_info.day && day_info.isCurrentMonth && day_info.hasEvents;
                  const is_today = day_info.isToday;

                  return (
                    <button
                      key={index}
                      onClick={() =>
                        day_info.isCurrentMonth &&
                        day_info.hasEvents &&
                        set_selected_date(day_info.day)
                      }
                      disabled={!day_info.isCurrentMonth}
                      className={`
                        aspect-square flex items-center justify-center text-sm rounded-md
                        transition-all duration-200 relative
                        ${!day_info.isCurrentMonth ? 'text-muted-foreground/40 cursor-default' : ''}
                        ${is_today && !is_hovered ? 'bg-primary text-primary-foreground font-bold' : ''}
                        ${is_today && is_hovered ? 'bg-primary text-primary-foreground font-bold ring-2 ring-primary/50 scale-110' : ''}
                        ${!is_today && day_info.isCurrentMonth ? 'hover:bg-muted' : ''}
                        ${selected_date === day_info.day && day_info.isCurrentMonth && !is_today ? 'ring-2 ring-primary bg-primary/10' : ''}
                        ${is_hovered && !is_today ? 'bg-primary/20 scale-110' : ''}
                        ${index % 7 === 0 && day_info.isCurrentMonth && !is_today ? 'text-red-500' : ''}
                        ${index % 7 === 6 && day_info.isCurrentMonth && !is_today ? 'text-blue-500' : ''}
                      `}
                    >
                      {day_info.day}
                      {day_info.hasEvents && (
                        <span
                          className={`
                          absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full
                          ${is_today ? 'bg-white' : 'bg-primary'}
                          ${is_hovered ? 'scale-150' : ''}
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
                총 {month_schedules.length}개 일정
              </span>
            </div>

            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
              {month_schedules.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  이번 달에는 예정된 무료 강의가 없습니다.
                </div>
              ) : (
                month_schedules.map((schedule) => {
                  const {
                    day,
                    dayOfWeek: _dayOfWeek,
                    dayName,
                  } = format_schedule_date(schedule.date);
                  const is_selected = selected_date === Number.parseInt(day, 10);
                  const { instructor, title } = format_course_name(schedule.course_name);

                  return (
                    <button
                      key={schedule.id}
                      onMouseEnter={() => set_hovered_date(Number.parseInt(day, 10))}
                      onMouseLeave={() => set_hovered_date(null)}
                      onClick={() => handle_course_click(schedule.course_id)}
                      className={`
                        w-full text-left px-4 py-3 rounded-lg border transition-all
                        hover:border-primary hover:bg-primary/10 hover:shadow-md
                        ${is_selected ? 'border-primary bg-primary/5' : 'border-border'}
                        ${hovered_date === Number.parseInt(day, 10) ? 'transform scale-[1.02]' : ''}
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
                          ${hovered_date === Number.parseInt(day, 10) ? 'translate-x-1' : ''}
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
