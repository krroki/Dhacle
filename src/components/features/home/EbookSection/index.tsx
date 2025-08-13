'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SectionTitle } from '../shared/SectionTitle';
import { EbookCard } from './EbookCard';
import { dummyEbooks } from '@/lib/dummy-data/home';
import { BookOpen } from 'lucide-react';

export function EbookSection() {
  const freeEbooks = dummyEbooks.filter(ebook => ebook.isFree);
  const paidEbooks = dummyEbooks.filter(ebook => !ebook.isFree);

  return (
    <section className="py-12 bg-muted/30">
      <div className="container-responsive">
        <div className="flex items-center gap-3 mb-8">
          <BookOpen className="w-6 h-6 text-primary" />
          <SectionTitle
            title="전자책 & 학습 자료"
            subtitle="언제 어디서나 학습할 수 있는 디지털 콘텐츠"
            className="mb-0"
          />
        </div>

        <Tabs defaultValue="free" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="free">무료 자료</TabsTrigger>
            <TabsTrigger value="paid">유료 자료</TabsTrigger>
          </TabsList>
          
          <TabsContent value="free">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {freeEbooks.map((ebook) => (
                <EbookCard key={ebook.id} ebook={ebook} />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="paid">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {paidEbooks.map((ebook) => (
                <EbookCard key={ebook.id} ebook={ebook} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}