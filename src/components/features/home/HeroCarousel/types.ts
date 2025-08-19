export interface HeroSlide {
  id: string;
  type: 'image' | 'youtube';
  title: string;
  subtitle: string;
  mediaUrl: string;
  ctaText: string;
  ctaLink: string;
}
