'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ContentBlock, AccordionItem } from '@/types/simple-course.types';

interface SimpleContentRendererProps {
  block: ContentBlock;
}

export default function SimpleContentRenderer({ block }: SimpleContentRendererProps) {
  const [openAccordions, setOpenAccordions] = useState<string[]>([]);

  const toggleAccordion = (id: string) => {
    setOpenAccordions(prev =>
      prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  switch (block.type) {
    case 'heading':
      return (
        <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mt-8 mb-4">
          {block.content}
        </h2>
      );

    case 'text':
      return (
        <p className="text-gray-700 leading-relaxed">
          {block.content}
        </p>
      );

    case 'image':
      return (
        <div className="relative w-full h-auto rounded-lg overflow-hidden my-6">
          <Image
            src={block.url || ''}
            alt={block.alt || '강의 이미지'}
            width={1400}
            height={800}
            className="w-full h-auto object-cover"
          />
        </div>
      );

    case 'gif':
      return (
        <div className="relative w-full h-auto rounded-lg overflow-hidden my-6">
          <img
            src={block.url}
            alt={block.alt || 'GIF 애니메이션'}
            className="w-full h-auto"
          />
        </div>
      );

    case 'video':
      return (
        <div className="relative aspect-video rounded-lg overflow-hidden my-6 bg-black">
          {block.url?.includes('youtube.com') || block.url?.includes('youtu.be') ? (
            <iframe
              src={block.url.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
              title={block.content || '강의 영상'}
              className="absolute inset-0 w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <video
              src={block.url}
              controls
              className="w-full h-full"
            >
              Your browser does not support the video tag.
            </video>
          )}
        </div>
      );

    case 'divider':
      return <hr className="my-8 border-gray-200" />;

    case 'grid':
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
          {block.columns?.map((column, colIndex) => (
            <div key={colIndex} className="space-y-2">
              {column.map((item) => (
                <SimpleContentRenderer key={item.id} block={item} />
              ))}
            </div>
          ))}
        </div>
      );

    case 'accordion':
      return (
        <div className="space-y-2 my-6">
          {block.items?.map((item: AccordionItem) => (
            <div
              key={item.id}
              className="border border-gray-200 rounded-lg overflow-hidden"
            >
              <button
                onClick={() => toggleAccordion(item.id)}
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <span className="font-medium text-gray-900">{item.title}</span>
                <svg
                  className={`w-5 h-5 text-gray-500 transition-transform ${
                    openAccordions.includes(item.id) ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {openAccordions.includes(item.id) && (
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <p className="text-gray-700">{item.content}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      );

    case 'button':
      return (
        <div className="my-6">
          <a
            href={block.url || '#'}
            className="inline-block bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            {block.content}
          </a>
        </div>
      );

    case 'html':
      return (
        <div 
          className="my-6 prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: block.content || '' }}
        />
      );

    default:
      return null;
  }
}