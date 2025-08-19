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
  lessonId: string;
  userId: string;
  title?: string;
  onProgress?: (progress: number) => void;
  initialProgress?: number;
  accessToken?: string;
}

export function VideoPlayer({
  streamUrl,
  lessonId,
  userId,
  title,
  onProgress,
  initialProgress = 0,
  accessToken,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(initialProgress);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [_isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);

  // HLS 초기화
  useEffect(() => {
    if (!videoRef.current || !streamUrl) {
      return;
    }

    const video = videoRef.current;

    if (Hls.isSupported()) {
      const hls = new Hls({
        xhrSetup: (xhr, _url) => {
          if (accessToken) {
            xhr.setRequestHeader('Authorization', `Bearer ${accessToken}`);
          }
        },
        maxBufferLength: 30,
        maxMaxBufferLength: 600,
        maxBufferSize: 60 * 1000 * 1000,
      });

      hls.loadSource(streamUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsLoading(false);
        if (initialProgress > 0) {
          video.currentTime = initialProgress;
        }
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          setIsLoading(false);
        }
      });

      hlsRef.current = hls;
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // iOS Safari native HLS support
      video.src = streamUrl;
      video.addEventListener('loadedmetadata', () => {
        setIsLoading(false);
        if (initialProgress > 0) {
          video.currentTime = initialProgress;
        }
      });
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, [streamUrl, accessToken, initialProgress]);

  // DRM 보호
  useEffect(() => {
    const preventContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    const preventKeyboard = (e: KeyboardEvent) => {
      // 스크린샷 방지 (PrintScreen은 브라우저에서 완전히 막을 수 없음)
      if (e.key === 'PrintScreen') {
        e.preventDefault();
        return false;
      }
    };

    // 우클릭 방지
    document.addEventListener('contextmenu', preventContextMenu);
    document.addEventListener('keydown', preventKeyboard);

    // 드래그 방지
    if (videoRef.current) {
      videoRef.current.style.userSelect = 'none';
      videoRef.current.style.webkitUserSelect = 'none';
    }

    return () => {
      document.removeEventListener('contextmenu', preventContextMenu);
      document.removeEventListener('keydown', preventKeyboard);
    };
  }, []);

  // 진도 저장 (10초마다)
  useEffect(() => {
    const saveProgress = debounce(async (time: number) => {
      try {
        await apiPost('/api/lessons/progress', {
          lessonId,
          progress: Math.floor(time),
        });
        onProgress?.(time);
      } catch (_error) {}
    }, 10000);

    const handleTimeUpdate = () => {
      const video = videoRef.current;
      if (!video) {
        return;
      }

      const time = video.currentTime;
      setCurrentTime(time);
      saveProgress(time);
    };

    const video = videoRef.current;
    if (video) {
      video.addEventListener('timeupdate', handleTimeUpdate);
      video.addEventListener('loadedmetadata', () => {
        setDuration(video.duration);
      });
    }

    return () => {
      if (video) {
        video.removeEventListener('timeupdate', handleTimeUpdate);
      }
    };
  }, [lessonId, onProgress]);

  // 컨트롤 함수들
  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, []);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    video.muted = !video.muted;
    setIsMuted(video.muted);
  }, []);

  const toggleFullscreen = useCallback(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    if (!document.fullscreenElement) {
      container.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  // 키보드 단축키
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const video = videoRef.current;
      if (!video) {
        return;
      }

      switch (e.key) {
        case ' ':
          e.preventDefault();
          togglePlay();
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
          setVolume((v) => Math.min(1, v + 0.1));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setVolume((v) => Math.max(0, v - 0.1));
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [toggleFullscreen, toggleMute, togglePlay]);

  // 컨트롤 자동 숨김
  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const hideControls = () => {
      if (isPlaying) {
        timeout = setTimeout(() => {
          setShowControls(false);
        }, 3000);
      }
    };

    const showControlsTemp = () => {
      setShowControls(true);
      clearTimeout(timeout);
      hideControls();
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', showControlsTemp);
      container.addEventListener('mouseleave', () => {
        if (isPlaying) {
          setShowControls(false);
        }
      });
    }

    hideControls();

    return () => {
      clearTimeout(timeout);
      if (container) {
        container.removeEventListener('mousemove', showControlsTemp);
      }
    };
  }, [isPlaying]);

  const handleSeek = (value: number[]) => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    const time = (value[0] / 100) * duration;
    video.currentTime = time;
    setCurrentTime(time);
  };

  const handleVolumeChange = (value: number[]) => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    const vol = value[0] / 100;
    video.volume = vol;
    setVolume(vol);
    setIsMuted(vol === 0);
  };

  const changePlaybackRate = () => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    const rates = [1, 1.25, 1.5, 1.75, 2];
    const currentIndex = rates.indexOf(playbackRate);
    const nextIndex = (currentIndex + 1) % rates.length;
    const newRate = rates[nextIndex];

    video.playbackRate = newRate;
    setPlaybackRate(newRate);
  };

  const formatTime = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);

    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="relative bg-black rounded-lg overflow-hidden" ref={containerRef}>
      <div className="relative aspect-video">
        {/* 비디오 엘리먼트 */}
        <video
          ref={videoRef}
          className="w-full h-full"
          playsInline={true}
          controlsList="nodownload noremoteplayback"
          disablePictureInPicture={true}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
        />

        {/* 동적 워터마크 */}
        <div className="absolute top-4 right-4 text-white/20 select-none pointer-events-none text-xs">
          {userId}
        </div>

        {/* 로딩 스피너 */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <Loader2 className="w-12 h-12 text-white animate-spin" />
          </div>
        )}

        {/* 컨트롤 오버레이 */}
        <div
          className={cn(
            'absolute inset-0 flex flex-col justify-between transition-opacity',
            showControls ? 'opacity-100' : 'opacity-0'
          )}
        >
          {/* 상단 바 */}
          <div className="bg-gradient-to-b from-black/70 to-transparent p-4">
            <h3 className="text-white font-medium">{title}</h3>
          </div>

          {/* 중앙 플레이 버튼 */}
          {!isPlaying && !isLoading && (
            <div className="flex-1 flex items-center justify-center">
              <Button
                size="lg"
                variant="ghost"
                className="w-20 h-20 rounded-full bg-black/50 hover:bg-black/70"
                onClick={togglePlay}
              >
                <Play className="w-10 h-10 text-white" />
              </Button>
            </div>
          )}

          {/* 하단 컨트롤 바 */}
          <div className="bg-gradient-to-t from-black/70 to-transparent p-4 space-y-2">
            {/* 진행 바 */}
            <Slider
              value={[duration > 0 ? (currentTime / duration) * 100 : 0]}
              onValueChange={handleSeek}
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
                  onClick={togglePlay}
                  className="text-white hover:bg-white/20"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>

                {/* 되감기/빨리감기 */}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    if (videoRef.current) {
                      videoRef.current.currentTime -= 10;
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
                    if (videoRef.current) {
                      videoRef.current.currentTime += 10;
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
                  onClick={toggleMute}
                  className="text-white hover:bg-white/20"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </Button>
                <div className="w-20">
                  <Slider
                    value={[isMuted ? 0 : volume * 100]}
                    onValueChange={handleVolumeChange}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>

                {/* 시간 표시 */}
                <span className="text-white text-sm ml-2">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* 배속 */}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={changePlaybackRate}
                  className="text-white hover:bg-white/20"
                >
                  {playbackRate}x
                </Button>

                {/* 전체화면 */}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={toggleFullscreen}
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
