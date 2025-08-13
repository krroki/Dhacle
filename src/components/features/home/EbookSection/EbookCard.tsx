import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, FileText } from 'lucide-react';
import type { Ebook } from '@/lib/dummy-data/home';

interface EbookCardProps {
  ebook: Ebook;
}

export function EbookCard({ ebook }: EbookCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
      <div className="relative aspect-[3/4]">
        <Image
          src={ebook.cover}
          alt={ebook.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {ebook.isFree && (
          <Badge className="absolute top-2 right-2 bg-green-500 text-white">
            무료
          </Badge>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-1 line-clamp-2">
          {ebook.title}
        </h3>
        <p className="text-sm text-muted-foreground mb-2">{ebook.author}</p>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {ebook.description}
        </p>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <Download className="w-3 h-3" />
            <span>{ebook.downloadCount.toLocaleString()}회</span>
          </div>
          <div className="flex items-center gap-1">
            <FileText className="w-3 h-3" />
            <span>{ebook.fileSize}</span>
          </div>
        </div>
        
        <Button className="w-full" variant={ebook.isFree ? 'default' : 'secondary'}>
          {ebook.isFree ? (
            '무료 다운로드'
          ) : (
            `₩${ebook.price?.toLocaleString()} 구매하기`
          )}
        </Button>
      </div>
    </Card>
  );
}