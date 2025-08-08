import type { Meta, StoryObj } from '@storybook/react';
import { ExperienceCard } from './ExperienceCard';

const meta = {
  title: 'Components/ExperienceCard',
  component: ExperienceCard,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    rating: {
      control: { type: 'number', min: 0, max: 5, step: 0.5 },
    },
    price: {
      control: { type: 'number' },
    },
    tags: {
      control: { type: 'array' },
    },
  },
} satisfies Meta<typeof ExperienceCard>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default story
export const Default: Story = {
  args: {
    id: '1',
    image: '/images/experiences/seoul-tour.jpg',
    imageAlt: '서울 야경 투어',
    title: '서울 야경 투어 - N서울타워와 한강 크루즈',
    rating: 4.5,
    reviewCount: 1234,
    price: 89000,
    currency: '₩',
    tags: ['베스트셀러', '즉시확정', '무료취소'],
  },
};

// With badge
export const WithBadge: Story = {
  args: {
    ...Default.args,
    badge: '20% 할인',
  },
};

// Saved state
export const Saved: Story = {
  args: {
    ...Default.args,
    isSaved: true,
  },
};

// Long title
export const LongTitle: Story = {
  args: {
    ...Default.args,
    title: '제주도 동부 UNESCO 세계자연유산 일일 투어 - 성산일출봉, 만장굴, 비자림 포함 (점심 식사 및 입장료 포함)',
  },
};

// Low rating
export const LowRating: Story = {
  args: {
    ...Default.args,
    rating: 2.5,
    reviewCount: 45,
  },
};

// High price
export const HighPrice: Story = {
  args: {
    ...Default.args,
    price: 1250000,
    badge: '프리미엄',
  },
};

// No tags
export const NoTags: Story = {
  args: {
    ...Default.args,
    tags: [],
  },
};

// Grid layout example
export const GridLayout: Story = {
  render: () => (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
      gap: '24px',
      padding: '24px'
    }}>
      <ExperienceCard 
        {...Default.args} 
        id="1" 
      />
      <ExperienceCard 
        {...Default.args} 
        id="2" 
        title="부산 감천문화마을 & 해동용궁사 투어" 
      />
      <ExperienceCard 
        {...Default.args} 
        id="3" 
        title="DMZ 투어 - 제3땅굴, 도라산역" 
        rating={5} 
      />
      <ExperienceCard 
        {...Default.args} 
        id="4" 
        title="경복궁 & 북촌한옥마을 도보 투어" 
        badge="인기" 
      />
    </div>
  ),
};