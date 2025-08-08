import type { Meta, StoryObj } from '@storybook/react';
import { SearchBar } from './SearchBar';

const meta = {
  title: 'Components/SearchBar',
  component: SearchBar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    placeholder: {
      control: 'text',
      description: 'Placeholder text for the search input',
    },
    showCategories: {
      control: 'boolean',
      description: 'Show or hide category filter pills',
    },
    autoFocus: {
      control: 'boolean',
      description: 'Auto-focus the input on mount',
    },
    width: {
      control: 'text',
      description: 'Width of the search bar',
    },
  },
} satisfies Meta<typeof SearchBar>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default story
export const Default: Story = {
  args: {
    placeholder: '강의, 템플릿, 효과음 검색...',
    showCategories: true,
  },
};

// Without categories
export const WithoutCategories: Story = {
  args: {
    placeholder: '검색어를 입력하세요',
    showCategories: false,
  },
};

// With default value
export const WithDefaultValue: Story = {
  args: {
    defaultValue: '쇼츠 편집',
    showCategories: true,
  },
};

// Focused state
export const AutoFocused: Story = {
  args: {
    autoFocus: true,
    showCategories: true,
  },
};

// Custom width
export const CustomWidth: Story = {
  args: {
    width: '400px',
    showCategories: true,
  },
};

// With search handler
export const WithSearchHandler: Story = {
  args: {
    showCategories: true,
    onSearch: (query: string, category?: string) => {
      console.log('Search:', { query, category });
      alert(`검색: ${query}${category ? ` (카테고리: ${category})` : ''}`);
    },
  },
};

// Mobile responsive
export const MobileResponsive: Story = {
  args: {
    showCategories: true,
    width: '100%',
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};

// With clear handler
export const WithClearHandler: Story = {
  args: {
    defaultValue: '초기 검색어',
    showCategories: true,
    onClear: () => {
      console.log('Search cleared');
      alert('검색어가 지워졌습니다');
    },
  },
};