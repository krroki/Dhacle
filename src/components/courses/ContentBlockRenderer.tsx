'use client';

import React from 'react';
import Image from 'next/image';
import { ContentBlock } from '@/types/simple-course.types';
import { StripeTypography } from '@/components/design-system';

interface ContentBlockRendererProps {
  block: ContentBlock;
}

export default function ContentBlockRenderer({ block }: ContentBlockRendererProps) {
  switch (block.type) {
    case 'heading':
      return (
        <StripeTypography variant="h3" className="mt-8 mb-4 text-gray-900">
          {block.content}
        </StripeTypography>
      );
    
    case 'text':
      return (
        <StripeTypography variant="body" className="text-gray-600 leading-relaxed">
          {block.content}
        </StripeTypography>
      );
    
    case 'image':
      return (
        <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-100">
          <Image
            src={block.url || ''}
            alt={block.alt || 'Course content image'}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 65vw, 800px"
          />
        </div>
      );
    
    case 'gif':
      return (
        <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-100">
          <img
            src={block.url || ''}
            alt={block.alt || 'Course animation'}
            className="w-full h-full object-cover"
          />
        </div>
      );
    
    case 'video':
      return (
        <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-900">
          {block.url?.includes('youtube') || block.url?.includes('youtu.be') ? (
            <iframe
              src={block.url}
              title={block.content || 'Course video'}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <video
              src={block.url}
              controls
              className="absolute inset-0 w-full h-full"
            >
              Your browser does not support the video tag.
            </video>
          )}
        </div>
      );
    
    case 'divider':
      return <hr className="border-gray-200 my-8" />;
    
    case 'grid':
      if (!block.columns) return null;
      return (
        <div className={`grid gap-6 grid-cols-1 md:grid-cols-${block.columns.length}`}>
          {block.columns.map((column, idx) => (
            <div key={idx} className="space-y-4">
              {column.map((item) => (
                <ContentBlockRenderer key={item.id} block={item} />
              ))}
            </div>
          ))}
        </div>
      );
    
    case 'accordion':
      if (!block.items) return null;
      return (
        <div className="space-y-3">
          {block.items.map((item) => (
            <details key={item.id} className="group border rounded-lg bg-white">
              <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors">
                <span className="font-medium text-gray-900">{item.title}</span>
                <svg 
                  className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="px-4 pb-4">
                <p className="text-gray-600">{item.content}</p>
              </div>
            </details>
          ))}
        </div>
      );
    
    case 'button':
      return (
        <div className="my-6">
          <button className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
            {block.content}
          </button>
        </div>
      );
    
    case 'html':
      return (
        <div 
          className="prose prose-gray max-w-none"
          dangerouslySetInnerHTML={{ __html: block.content || '' }}
        />
      );
    
    default:
      return null;
  }
}