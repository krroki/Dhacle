'use client';

import Image from 'next/image';
import { sanitizeRichHTML } from '@/lib/security/sanitizer';
import type { ContentBlock } from '@/types';

interface ContentBlocksProps {
  blocks?: ContentBlock[];
}

export function ContentBlocks({ blocks }: ContentBlocksProps) {
  if (!blocks || blocks.length === 0) {
    return null;
  }

  const render_block = (block: ContentBlock) => {
    switch (block.type) {
      case 'text': {
        const safe_content = sanitizeRichHTML(block.content as string);
        return (
          <div
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: safe_content }}
          />
        );
      }

      case 'image': {
        const image_content = block.content as { url: string; alt?: string; caption?: string };
        return (
          <figure className="my-8">
            <div className="relative aspect-video rounded-lg overflow-hidden">
              <Image
                src={image_content.url}
                alt={image_content.alt || ''}
                fill={true}
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 66vw"
              />
            </div>
            {image_content.caption && (
              <figcaption className="text-sm text-muted-foreground text-center mt-2">
                {image_content.caption}
              </figcaption>
            )}
          </figure>
        );
      }

      case 'video': {
        const video_content = block.content as { url: string; title?: string };
        return (
          <div className="my-8">
            <div className="aspect-video rounded-lg overflow-hidden bg-black">
              <iframe
                src={video_content.url}
                title={video_content.title}
                className="w-full h-full"
                allowFullScreen={true}
              />
            </div>
          </div>
        );
      }

      case 'quote': {
        const quote_content = block.content as { text: string; author?: string };
        return (
          <blockquote className="border-l-4 border-primary pl-6 py-4 my-8 italic">
            <p className="text-lg mb-2">{quote_content.text}</p>
            {quote_content.author && (
              <footer className="text-sm text-muted-foreground">— {quote_content.author}</footer>
            )}
          </blockquote>
        );
      }

      case 'list': {
        const list_content = block.content as { items: string[]; ordered?: boolean };
        const ListTag = list_content.ordered ? 'ol' : 'ul';
        return (
          <ListTag className="my-6 space-y-2">
            {list_content.items.map((item, index) => (
              <li key={`list-item-${block.order}-${index}`} className="flex items-start gap-2">
                <span className="text-primary mt-1">
                  {list_content.ordered ? `${index + 1}.` : '•'}
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ListTag>
        );
      }

      case 'code': {
        const code_content = block.content as { code: string; language?: string };
        return (
          <pre className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 overflow-x-auto my-6">
            <code className={`language-${code_content.language || 'plaintext'}`}>
              {code_content.code}
            </code>
          </pre>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {blocks
        .sort((a, b) => a.order - b.order)
        .map((block) => (
          <div key={`content-block-${block.order}`}>{render_block(block)}</div>
        ))}
    </div>
  );
}
