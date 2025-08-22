'use client';

import { Play } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

interface YouTubeEmbedProps {
  video_id: string;
  title?: string;
}

export function YouTubeEmbed({ video_id, title = 'YouTube video' }: YouTubeEmbedProps) {
  const [is_loaded, set_is_loaded] = useState(false);
  const thumbnail_url = `https://img.youtube.com/vi/${video_id}/maxresdefault.jpg`;

  if (!is_loaded) {
    return (
      <div
        className="relative w-full h-full cursor-pointer group"
        onClick={() => set_is_loaded(true)}
      >
        <Image
          src={thumbnail_url}
          alt={title}
          fill={true}
          className="object-cover"
          priority={true}
        />
        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-red-600 rounded-full p-4 group-hover:scale-110 transition-transform">
            <Play className="w-12 h-12 text-white fill-white" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <iframe
      src={`https://www.youtube.com/embed/${video_id}?autoplay=1&rel=0`}
      title={title}
      className="w-full h-full"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen={true}
    />
  );
}
