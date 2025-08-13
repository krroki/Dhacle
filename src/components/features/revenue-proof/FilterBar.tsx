'use client';

import { Button } from '@/components/ui/button';
import { Youtube, Instagram } from 'lucide-react';

interface FilterBarProps {
  platform: 'all' | 'youtube' | 'instagram' | 'tiktok';
  onPlatformChange: (platform: 'all' | 'youtube' | 'instagram' | 'tiktok') => void;
}

export function FilterBar({ platform, onPlatformChange }: FilterBarProps) {
  return (
    <div className="flex items-center gap-2 mb-6">
      <span className="text-sm text-muted-foreground">플랫폼:</span>
      <div className="flex gap-2">
        <Button
          variant={platform === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onPlatformChange('all')}
        >
          전체
        </Button>
        <Button
          variant={platform === 'youtube' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onPlatformChange('youtube')}
          className={platform === 'youtube' ? 'bg-red-500 hover:bg-red-600' : ''}
        >
          <Youtube className="w-4 h-4 mr-1" />
          YouTube
        </Button>
        <Button
          variant={platform === 'instagram' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onPlatformChange('instagram')}
          className={platform === 'instagram' ? 'bg-gradient-to-r from-purple-500 to-pink-500' : ''}
        >
          <Instagram className="w-4 h-4 mr-1" />
          Instagram
        </Button>
        <Button
          variant={platform === 'tiktok' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onPlatformChange('tiktok')}
          className={platform === 'tiktok' ? 'bg-black hover:bg-gray-900' : ''}
        >
          TikTok
        </Button>
      </div>
    </div>
  );
}