// Server Component: Information Banner
// Static info display without dismissible state

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

type BannerType = 'info' | 'success' | 'warning' | 'error';

interface InfoBannerProps {
  type: BannerType;
  title?: string;
  children: React.ReactNode;
  badge?: string;
  className?: string;
}

const bannerConfig = {
  info: {
    icon: Info,
    variant: 'default' as const,
    className: 'border-blue-200 bg-blue-50 text-blue-900',
  },
  success: {
    icon: CheckCircle,
    variant: 'default' as const,
    className: 'border-green-200 bg-green-50 text-green-900',
  },
  warning: {
    icon: AlertTriangle,
    variant: 'default' as const,
    className: 'border-yellow-200 bg-yellow-50 text-yellow-900',
  },
  error: {
    icon: AlertCircle,
    variant: 'destructive' as const,
    className: 'border-red-200 bg-red-50 text-red-900',
  },
};

export function InfoBanner({
  type,
  title,
  children,
  badge,
  className,
}: InfoBannerProps) {
  const config = bannerConfig[type];
  const Icon = config.icon;

  return (
    <Alert 
      variant={config.variant}
      className={cn(config.className, className)}
    >
      <Icon className="h-4 w-4" />
      
      {(title || badge) && (
        <AlertTitle className="flex items-center gap-2">
          {title}
          {badge && (
            <Badge variant="outline" className="text-xs">
              {badge}
            </Badge>
          )}
        </AlertTitle>
      )}
      
      <AlertDescription className="mt-2">
        {children}
      </AlertDescription>
    </Alert>
  );
}