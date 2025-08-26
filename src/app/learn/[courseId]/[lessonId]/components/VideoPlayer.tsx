'use client';

import Hls from 'hls.js';
import debounce from 'lodash.debounce';
import {
  Loader2,
  Maximize,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { apiPost } from '@/lib/api-client';
import { cn } from '@/lib/utils';

interface VideoPlayerProps {
  streamUrl: string;
  lesson_id: string;
  user_id: string;
  title?: string;
  onProgress?: (progress: number) => void;
  initialProgress?: number;
  access_token?: string;
}

export function VideoPlayer({
  streamUrl,
  lesson_id,
  user_id,
  title,
  onProgress,
  initialProgress = 0,
  access_token,
}: VideoPlayerProps) {
  const video_ref = useRef<HTMLVideoElement>(null);
  const container_ref = useRef<HTMLDivElement>(null);
  const hls_ref = useRef<Hls | null>(null);

  const [is_playing, set_is_playing] = useState(false);
  const [current_time, set_current_time] = useState(initialProgress);
  const [duration, set_duration] = useState(0);
  const [volume, set_volume] = useState(1);
  const [is_muted, set_is_muted] = useState(false);
  const [_isFullscreen, set_is_fullscreen] = useState(false);
  const [is_loading, set_is_loading] = useState(true);
  const [show_controls, set_show_controls] = useState(true);
  const [playback_rate, set_playback_rate] = useState(1);

  // HLS 초기화
  useEffect(() => {
    if (!video_ref.current || !streamUrl) {
      return;
    }

    const video = video_ref.current;

    if (Hls.isSupported()) {
      const hls = new Hls({
        xhrSetup: (xhr, _url) => {
          if (access_token) {
            xhr.setRequestHeader('Authorization', `Bearer ${access_token}`);
          }
        },
        maxBufferLength: 30,
        maxMaxBufferLength: 600,
        maxBufferSize: 60 * 1000 * 1000,
      });

      hls.loadSource(streamUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        set_is_loading(false);
        if (initialProgress > 0) {
          video.currentTime = initialProgress;
        }
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          set_is_loading(false);
        }
      });

      hls_ref.current = hls;
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // iOS Safari native HLS support
      video.src = streamUrl;
      video.addEventListener('loadedmetadata', () => {
        set_is_loading(false);
        if (initialProgress > 0) {
          video.currentTime = initialProgress;
        }
      });
    }

    return () => {
      if (hls_ref.current) {
        hls_ref.current.destroy();
      }
    };
  }, [streamUrl, access_token, initialProgress]);

  // DRM 보호
  useEffect(() => {
    const prevent_context_menu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    const prevent_keyboard = (e: KeyboardEvent) => {
      // 스크린샷 방지 (PrintScreen은 브라우저에서 완전히 막을 수 없음)
      if (e.key === 'PrintScreen') {
        e.preventDefault();
        return false;
      }
      return true;
    };

    // 우클릭 방지
    document.addEventListener('contextmenu', prevent_context_menu);
    document.addEventListener('keydown', prevent_keyboard);

    // 드래그 방지
    if (video_ref.current) {
      video_ref.current.style.userSelect = 'none';
      video_ref.current.style.webkitUserSelect = 'none';
    }

    return () => {
      document.removeEventListener('contextmenu', prevent_context_menu);
      document.removeEventListener('keydown', prevent_keyboard);
    };
  }, []);

  // 진도 저장 (10초마다)
  useEffect(() => {
    const save_progress = debounce(async (time: number) => {
      try {
        await apiPost('/api/lessons/progress', {
          lesson_id,
          progress: Math.floor(time),
        });
        onProgress?.(time);
      } catch (error) {
        // Silently fail for progress saving - non-critical operation
        console.warn('Failed to save lesson progress:', error);
      }
    }, 10000);

    const handle_time_update = () => {
      const video = video_ref.current;
      if (!video) {
        return;
      }

      const time = video.currentTime;
      set_current_time(time);
      save_progress(time);
    };

    const video = video_ref.current;
    if (video) {
      video.addEventListener('timeupdate', handle_time_update);
      video.addEventListener('loadedmetadata', () => {
        set_duration(video.duration);
      });
    }

    return () => {
      if (video) {
        video.removeEventListener('timeupdate', handle_time_update);
      }
    };
  }, [lesson_id, onProgress]);

  // 컨트롤 함수들
  const toggle_play = useCallback(() => {
    const video = video_ref.current;
    if (!video) {
      return;
    }

    if (video.paused) {
      video.play();
      set_is_playing(true);
    } else {
      video.pause();
      set_is_playing(false);
    }
  }, []);

  const toggle_mute = useCallback(() => {
    const video = video_ref.current;
    if (!video) {
      return;
    }

    video.muted = !video.muted;
    set_is_muted(video.muted);
  }, []);

  const toggle_fullscreen = useCallback(() => {
    const container = container_ref.current;
    if (!container) {
      return;
    }

    if (!document.fullscreenElement) {
      container.requestFullscreen();
      set_is_fullscreen(true);
    } else {
      document.exitFullscreen();
      set_is_fullscreen(false);
    }
  }, []);

  // 키보드 단축키
  useEffect(() => {
    const handle_key_press = (e: KeyboardEvent) => {
      const video = video_ref.current;
      if (!video) {
        return;
      }

      switch (e.key) {
        case ' ':
          e.preventDefault();
          toggle_play();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          video.currentTime = Math.max(0, video.currentTime - 10);
          break;
        case 'ArrowRight':
          e.preventDefault();
          video.currentTime = Math.min(video.duration, video.currentTime + 10);
          break;
        case 'ArrowUp':
          e.preventDefault();
          set_volume((v) => Math.min(1, v + 0.1));
          break;
        case 'ArrowDown':
          e.preventDefault();
          set_volume((v) => Math.max(0, v - 0.1));
          break;
        case 'f':
          e.preventDefault();
          toggle_fullscreen();
          break;
        case 'm':
          e.preventDefault();
          toggle_mute();
          break;
      }
    };

    document.addEventListener('keydown', handle_key_press);
    return () => document.removeEventListener('keydown', handle_key_press);
  }, [toggle_fullscreen, toggle_mute, toggle_play]);

  // 컨트롤 자동 숨김
  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const hide_controls = () => {
      if (is_playing) {
        timeout = setTimeout(() => {
          set_show_controls(false);
        }, 3000);
      }
    };

    const show_controls_temp = () => {
      set_show_controls(true);
      clearTimeout(timeout);
      hide_controls();
    };

    const container = container_ref.current;
    if (container) {
      container.addEventListener('mousemove', show_controls_temp);
      container.addEventListener('mouseleave', () => {
        if (is_playing) {
          set_show_controls(false);
        }
      });
    }

    hide_controls();

    return () => {
      clearTimeout(timeout);
      if (container) {
        container.removeEventListener('mousemove', show_controls_temp);
      }
    };
  }, [is_playing]);

  const handle_seek = (value: number[]) => {
    const video = video_ref.current;
    if (!video || value[0] === undefined) {
      return;
    }

    const time = (value[0] / 100) * duration;
    video.currentTime = time;
    set_current_time(time);
  };

  const handle_volume_change = (value: number[]) => {
    const video = video_ref.current;
    if (!video || value[0] === undefined) {
      return;
    }

    const vol = value[0] / 100;
    video.volume = vol;
    set_volume(vol);
    set_is_muted(vol === 0);
  };

  const change_playback_rate = () => {
    const video = video_ref.current;
    if (!video) {
      return;
    }

    const rates = [1, 1.25, 1.5, 1.75, 2];
    const current_index = rates.indexOf(playback_rate);
    const next_index = (current_index + 1) % rates.length;
    const new_rate = rates[next_index] ?? 1;

    video.playbackRate = new_rate;
    set_playback_rate(new_rate);
  };

  const format_time = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);

    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="relative bg-black rounded-lg overflow-hidden" ref={container_ref}>
      <div className="relative aspect-video">
        {/* 비디오 엘리먼트 */}
        <video
          ref={video_ref}
          className="w-full h-full"
          playsInline={true}
          controlsList="nodownload noremoteplayback"
          disablePictureInPicture={true}
          onPlay={() => set_is_playing(true)}
          onPause={() => set_is_playing(false)}
          onEnded={() => set_is_playing(false)}
        />

        {/* 동적 워터마크 */}
        <div className="absolute top-4 right-4 text-white/20 select-none pointer-events-none text-xs">
          {user_id}
        </div>

        {/* 로딩 스피너 */}
        {is_loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <Loader2 className="w-12 h-12 text-white animate-spin" />
          </div>
        )}

        {/* 컨트롤 오버레이 */}
        <div
          className={cn(
            'absolute inset-0 flex flex-col justify-between transition-opacity',
            show_controls ? 'opacity-100' : 'opacity-0'
          )}
        >
          {/* 상단 바 */}
          <div className="bg-gradient-to-b from-black/70 to-transparent p-4">
            <h3 className="text-white font-medium">{title}</h3>
          </div>

          {/* 중앙 플레이 버튼 */}
          {!is_playing && !is_loading && (
            <div className="flex-1 flex items-center justify-center">
              <Button
                size="lg"
                variant="ghost"
                className="w-20 h-20 rounded-full bg-black/50 hover:bg-black/70"
                onClick={toggle_play}
              >
                <Play className="w-10 h-10 text-white" />
              </Button>
            </div>
          )}

          {/* 하단 컨트롤 바 */}
          <div className="bg-gradient-to-t from-black/70 to-transparent p-4 space-y-2">
            {/* 진행 바 */}
            <Slider
              value={[duration > 0 ? (current_time / duration) * 100 : 0]}
              onValueChange={handle_seek}
              className="w-full"
              max={100}
              step={0.1}
            />

            {/* 컨트롤 버튼들 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {/* 재생/일시정지 */}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={toggle_play}
                  className="text-white hover:bg-white/20"
                >
                  {is_playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>

                {/* 되감기/빨리감기 */}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    if (video_ref.current) {
                      video_ref.current.currentTime -= 10;
                    }
                  }}
                  className="text-white hover:bg-white/20"
                >
                  <SkipBack className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    if (video_ref.current) {
                      video_ref.current.currentTime += 10;
                    }
                  }}
                  className="text-white hover:bg-white/20"
                >
                  <SkipForward className="w-4 h-4" />
                </Button>

                {/* 볼륨 */}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={toggle_mute}
                  className="text-white hover:bg-white/20"
                >
                  {is_muted || volume === 0 ? (
                    <VolumeX className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </Button>
                <div className="w-20">
                  <Slider
                    value={[is_muted ? 0 : volume * 100]}
                    onValueChange={handle_volume_change}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>

                {/* 시간 표시 */}
                <span className="text-white text-sm ml-2">
                  {format_time(current_time)} / {format_time(duration)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* 배속 */}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={change_playback_rate}
                  className="text-white hover:bg-white/20"
                >
                  {playback_rate}x
                </Button>

                {/* 전체화면 */}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={toggle_fullscreen}
                  className="text-white hover:bg-white/20"
                >
                  <Maximize className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
