// Server Component: Status Badge
// Static status display without client-side interactions

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { CheckCircle, AlertCircle, XCircle, Clock } from 'lucide-react';

type StatusType = 'success' | 'warning' | 'error' | 'pending';

interface StatusBadgeProps {
  status: StatusType;
  text?: string;
  showIcon?: boolean;
  className?: string;
}

const statusConfig = {
  success: {
    variant: 'default' as const,
    icon: CheckCircle,
    className: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-100',
    defaultText: '성공',
  },
  warning: {
    variant: 'secondary' as const, 
    icon: AlertCircle,
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100',
    defaultText: '주의',
  },
  error: {
    variant: 'destructive' as const,
    icon: XCircle, 
    className: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-100',
    defaultText: '오류',
  },
  pending: {
    variant: 'outline' as const,
    icon: Clock,
    className: 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-100',
    defaultText: '대기',
  },
};

export function StatusBadge({ 
  status, 
  text, 
  showIcon = true, 
  className 
}: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;
  
  return (
    <Badge
      variant={config.variant}
      className={cn(config.className, className)}
    >
      {showIcon && <Icon className="h-3 w-3 mr-1" />}
      {text || config.defaultText}
    </Badge>
  );
}