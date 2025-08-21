'use client';

import Image from 'next/image';
import { sanitizeRichHTML } from '@/lib/security/sanitizer';
import type { ContentBlock } from '@/types/course';

interface ContentBlocksProps {
  blocks?: ContentBlock[];
}

export function ContentBlocks({ blocks }: ContentBlocksProps) {
  if (!blocks || blocks.length === 0) {
    return null;
  }

  const renderBlock = (block: ContentBlock) => {
    switch (block.type) {
      case 'text': {
        const safeContent = sanitizeRichHTML(block.content as string);
        return (
          <div
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: safeContent }}
          />
        );
      }

      case 'image': {
        const imageContent = block.content as { url: string; alt?: string; caption?: string };
        return (
          <figure className="my-8">
            <div className="relative aspect-video rounded-lg overflow-hidden">
              <Image
                src={imageContent.url}
                alt={imageContent.alt || ''}
                fill={true}
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 66vw"
              />
            </div>
            {imageContent.caption && (
              <figcaption className="text-sm text-muted-foreground text-center mt-2">
                {imageContent.caption}
              </figcaption>
            )}
          </figure>
        );
      }

      case 'video': {
        const videoContent = block.content as { url: string; title?: string };
        return (
          <div className="my-8">
            <div className="aspect-video rounded-lg overflow-hidden bg-black">
              <iframe
                src={videoContent.url}
                title={videoContent.title}
                className="w-full h-full"
                allowFullScreen={true}
              />
            </div>
          </div>
        );
      }

      case 'quote': {
        const quoteContent = block.content as { text: string; author?: string };
        return (
          <blockquote className="border-l-4 border-primary pl-6 py-4 my-8 italic">
            <p className="text-lg mb-2">{quoteContent.text}</p>
            {quoteContent.author && (
              <footer className="text-sm text-muted-foreground">— {quoteContent.author}</footer>
            )}
          </blockquote>
        );
      }

      case 'list': {
        const listContent = block.content as { items: string[]; ordered?: boolean };
        const ListTag = listContent.ordered ? 'ol' : 'ul';
        return (
          <ListTag className="my-6 space-y-2">
            {listContent.items.map((item, index) => (
              <li key={`list-item-${block.order}-${index}`} className="flex items-start gap-2">
                <span className="text-primary mt-1">
                  {listContent.ordered ? `${index + 1}.` : '•'}
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ListTag>
        );
      }

      case 'code': {
        const codeContent = block.content as { code: string; language?: string };
        return (
          <pre className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 overflow-x-auto my-6">
            <code className={`language-${codeContent.language || 'plaintext'}`}>
              {codeContent.code}
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
          <div key={`content-block-${block.order}`}>{renderBlock(block)}</div>
        ))}
    </div>
  );
}
