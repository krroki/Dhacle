'use client';

import { HelpCircle } from 'lucide-react';
import { useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { dummyFAQs } from '@/lib/dummy-data/home';
import { SectionTitle } from '../shared/SectionTitle';

export function FAQSection() {
  const categories = ['전체', '일반', '강의', '결제', '환불'];
  const [selectedCategory, setSelectedCategory] = useState('전체');

  const filteredFAQs =
    selectedCategory === '전체'
      ? dummyFAQs
      : dummyFAQs.filter((faq) => faq.category === selectedCategory);

  return (
    <section className="py-12">
      <div className="container-responsive">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <HelpCircle className="w-6 h-6 text-primary" />
            <SectionTitle
              title="자주 묻는 질문"
              subtitle="궁금하신 점을 빠르게 해결해드립니다"
              align="center"
              className="mb-0 flex-1"
            />
          </div>

          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="grid w-full grid-cols-5 mb-8">
              {categories.map((category) => (
                <TabsTrigger key={category} value={category}>
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value={selectedCategory}>
              <Accordion type="single" collapsible={true} className="w-full">
                {filteredFAQs.map((faq) => (
                  <AccordionItem key={faq.id} value={faq.id}>
                    <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                    <AccordionContent>
                      <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </TabsContent>
          </Tabs>

          {filteredFAQs.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              해당 카테고리에 등록된 질문이 없습니다.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
