'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Users, Video } from 'lucide-react';
import type { CourseSchedule } from '@/lib/dummy-data/home';

interface EventModalProps {
  events: CourseSchedule[];
  date: string;
  isOpen: boolean;
  onClose: () => void;
}

export function EventModal({ events, date, isOpen, onClose }: EventModalProps) {
  if (events.length === 0) return null;

  const formattedDate = new Date(date).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            {formattedDate} 일정
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {events.map((event) => (
            <div key={event.id} className="border rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold">{event.courseName}</h3>
                {event.isLive && (
                  <Badge className="bg-red-500 text-white">LIVE</Badge>
                )}
              </div>
              
              <p className="text-sm text-muted-foreground mb-3">
                강사: {event.instructor}
              </p>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span>{event.time}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span>
                    {event.registeredCount}/{event.maxCapacity}명 신청
                  </span>
                </div>
                
                {event.isLive && (
                  <div className="flex items-center gap-2">
                    <Video className="w-4 h-4 text-muted-foreground" />
                    <span>실시간 라이브 강의</span>
                  </div>
                )}
              </div>
              
              <Button 
                className="w-full mt-4" 
                disabled={event.registeredCount >= event.maxCapacity}
              >
                {event.registeredCount >= event.maxCapacity 
                  ? '정원 마감' 
                  : '수강 신청하기'
                }
              </Button>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}