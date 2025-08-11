'use client';

import React from 'react';
import Image from 'next/image';
import { ContentBlock } from '@/types/course-detail.types';
import { StripeTypography, StripeButton } from '@/components/design-system';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface CourseContentRendererProps {
  blocks: ContentBlock[];
}

export default function CourseContentRenderer({ blocks }: CourseContentRendererProps) {
  const [expandedAccordions, setExpandedAccordions] = React.useState<Set<string>>(new Set());

  const toggleAccordion = (id: string) => {
    setExpandedAccordions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const renderBlock = (block: ContentBlock): React.ReactNode => {
    switch (block.type) {
      case 'heading':
        return (
          <StripeTypography 
            key={block.id} 
            variant="h2" 
            color="dark"
            className="mb-6 mt-10"
            style={block.style}
          >
            {block.content}
          </StripeTypography>
        );

      case 'text':
        return (
          <StripeTypography 
            key={block.id} 
            variant="body" 
            color="dark"
            className="mb-4 leading-relaxed"
            style={block.style}
          >
            {block.content}
          </StripeTypography>
        );

      case 'image':
        return (
          <div 
            key={block.id} 
            className="relative w-full mb-8 rounded-lg overflow-hidden"
            style={block.style}
          >
            <img
              src={block.url}
              alt={block.alt || ''}
              className="w-full h-auto"
              loading="lazy"
            />
          </div>
        );

      case 'video':
        return (
          <div 
            key={block.id} 
            className="relative w-full mb-8 rounded-lg overflow-hidden bg-black"
            style={{ aspectRatio: '16/9', ...block.style }}
          >
            <video
              src={block.url}
              controls
              className="absolute inset-0 w-full h-full"
              poster={block.thumbnail}
            >
              Your browser does not support the video tag.
            </video>
          </div>
        );

      case 'gif':
        return (
          <div 
            key={block.id} 
            className="relative w-full mb-8 rounded-lg overflow-hidden"
            style={block.style}
          >
            <img
              src={block.url}
              alt={block.alt || ''}
              className="w-full h-auto"
              loading="lazy"
            />
          </div>
        );

      case 'grid':
        return (
          <div 
            key={block.id} 
            className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
            style={block.style}
          >
            {block.columns.map((column, colIndex) => (
              <div key={colIndex} className="space-y-4">
                {column.map((item) => renderBlock(item))}
              </div>
            ))}
          </div>
        );

      case 'divider':
        return (
          <hr 
            key={block.id} 
            className="my-12 border-t border-gray-200"
            style={block.style}
          />
        );

      case 'button':
        return (
          <div key={block.id} className="mb-6">
            <a href={block.url} target="_blank" rel="noopener noreferrer">
              <StripeButton 
                variant={block.variant || 'primary'} 
                size="lg"
              >
                {block.content}
              </StripeButton>
            </a>
          </div>
        );

      case 'html':
        return (
          <div 
            key={block.id}
            className="mb-8"
            dangerouslySetInnerHTML={{ __html: block.content }}
            style={block.style}
          />
        );

      case 'accordion':
        return (
          <div key={block.id} className="mb-8 space-y-3">
            {block.items.map((item) => {
              const isExpanded = expandedAccordions.has(item.id);
              return (
                <div 
                  key={item.id} 
                  className="border border-gray-200 rounded-lg overflow-hidden"
                >
                  <button
                    onClick={() => toggleAccordion(item.id)}
                    className="w-full px-6 py-4 flex items-center justify-between bg-white hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-medium text-left">{item.title}</span>
                    {isExpanded ? (
                      <ChevronUp size={20} className="text-gray-400" />
                    ) : (
                      <ChevronDown size={20} className="text-gray-400" />
                    )}
                  </button>
                  {isExpanded && (
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                      <StripeTypography variant="body" color="dark">
                        {item.content}
                      </StripeTypography>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="prose prose-lg max-w-none">
      {blocks.map(block => renderBlock(block))}
    </div>
  );
}