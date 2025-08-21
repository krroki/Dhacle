import { Badge } from '@/components/ui/badge';
import type { CourseSchedule } from '@/lib/dummy-data/home';
import { cn } from '@/lib/utils';

interface CalendarCellProps {
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: CourseSchedule[];
  onClick?: () => void;
}

export function CalendarCell({ day, isCurrentMonth, isToday, events, onClick }: CalendarCellProps) {
  if (day <= 0) {
    return <div className="h-20" />;
  }

  return (
    <div
      className={cn(
        'h-20 p-2 border rounded-lg cursor-pointer transition-colors',
        !isCurrentMonth && 'opacity-50',
        isToday && 'bg-primary/10 border-primary',
        events.length > 0 && 'hover:bg-muted',
        'relative'
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-1">
        <span className={cn('text-sm font-medium', isToday && 'text-primary')}>{day}</span>
        {events.length > 0 && (
          <Badge variant="secondary" className="text-xs px-1 py-0">
            {events.length}
          </Badge>
        )}
      </div>

      {events.slice(0, 2).map((event) => (
        <div key={event.id} className="text-xs truncate mb-1" title={event.courseName}>
          <span
            className={cn(
              'inline-block w-1 h-1 rounded-full mr-1',
              event.isLive ? 'bg-red-500' : 'bg-blue-500'
            )}
          />
          <span className="text-muted-foreground">{event.time}</span>
        </div>
      ))}

      {events.length > 2 && (
        <div className="text-xs text-muted-foreground">+{events.length - 2}개 더보기</div>
      )}
    </div>
  );
}
