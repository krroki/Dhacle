'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SectionTitle } from '../shared/SectionTitle';
import { CalendarCell } from './CalendarCell';
import { EventModal } from './EventModal';
import { dummyCourseSchedules } from '@/lib/dummy-data/home';
import type { CourseSchedule } from '@/lib/dummy-data/home';

export function FreeCoursesSchedule() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  
  const today = new Date();
  const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year;
  
  const monthNames = [
    '1월', '2월', '3월', '4월', '5월', '6월',
    '7월', '8월', '9월', '10월', '11월', '12월'
  ];
  
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
  
  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1));
  };
  
  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1));
  };
  
  const getEventsForDay = (day: number): CourseSchedule[] => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return dummyCourseSchedules.filter(schedule => schedule.date === dateStr);
  };
  
  const handleDayClick = (day: number) => {
    const events = getEventsForDay(day);
    if (events.length > 0) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      setSelectedDate(dateStr);
      setIsModalOpen(true);
    }
  };
  
  const calendarDays = [];
  
  // Previous month days
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    calendarDays.push({
      day: daysInPrevMonth - i,
      isCurrentMonth: false,
      isToday: false,
      events: [],
    });
  }
  
  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push({
      day,
      isCurrentMonth: true,
      isToday: isCurrentMonth && day === today.getDate(),
      events: getEventsForDay(day),
    });
  }
  
  // Next month days to fill the grid
  const remainingDays = 42 - calendarDays.length;
  for (let day = 1; day <= remainingDays; day++) {
    calendarDays.push({
      day,
      isCurrentMonth: false,
      isToday: false,
      events: [],
    });
  }

  return (
    <section className="py-12 bg-muted/30">
      <div className="container-responsive">
        <SectionTitle
          title="무료 강의 일정"
          subtitle="라이브 강의와 특별 세미나 일정을 확인하세요"
          align="center"
        />
        
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold">
              {year}년 {monthNames[month]}
            </h3>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={prevMonth}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={nextMonth}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-7 gap-2 mb-2">
            {dayNames.map((day) => (
              <div
                key={day}
                className="text-center text-sm font-semibold py-2"
              >
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((dayInfo, index) => (
              <CalendarCell
                key={index}
                day={dayInfo.day}
                isCurrentMonth={dayInfo.isCurrentMonth}
                isToday={dayInfo.isToday}
                events={dayInfo.events}
                onClick={() => dayInfo.isCurrentMonth && handleDayClick(dayInfo.day)}
              />
            ))}
          </div>
        </Card>
        
        <EventModal
          events={selectedDate ? getEventsForDay(parseInt(selectedDate.split('-')[2])) : []}
          date={selectedDate || ''}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </div>
    </section>
  );
}