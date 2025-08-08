import type { Meta, StoryObj } from '@storybook/react';
import { PillButton } from './PillButton';

const meta = {
  title: 'Components/PillButton',
  component: PillButton,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A pill-shaped button component with TripAdvisor styling and Stripe design tokens.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'ghost', 'cta'],
      description: 'The visual style variant of the button',
      table: {
        defaultValue: { summary: 'primary' },
      },
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
      description: 'The size of the button',
      table: {
        defaultValue: { summary: 'md' },
      },
    },
    fullWidth: {
      control: 'boolean',
      description: 'Whether the button should take up the full width of its container',
      table: {
        defaultValue: { summary: false },
      },
    },
    loading: {
      control: 'boolean',
      description: 'Whether the button is in a loading state',
      table: {
        defaultValue: { summary: false },
      },
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the button is disabled',
      table: {
        defaultValue: { summary: false },
      },
    },
  },
} satisfies Meta<typeof PillButton>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default story
export const Default: Story = {
  args: {
    children: '버튼',
    variant: 'primary',
    size: 'md',
  },
};

// All variants
export const Primary: Story = {
  args: {
    children: 'Primary Button',
    variant: 'primary',
    size: 'md',
  },
};

export const Secondary: Story = {
  args: {
    children: 'Secondary Button',
    variant: 'secondary',
    size: 'md',
  },
};

export const Ghost: Story = {
  args: {
    children: 'Ghost Button',
    variant: 'ghost',
    size: 'md',
  },
};

export const CTA: Story = {
  args: {
    children: 'Call to Action',
    variant: 'cta',
    size: 'md',
  },
};

// All sizes
export const Small: Story = {
  args: {
    children: 'Small Button',
    variant: 'primary',
    size: 'sm',
  },
};

export const Medium: Story = {
  args: {
    children: 'Medium Button',
    variant: 'primary',
    size: 'md',
  },
};

export const Large: Story = {
  args: {
    children: 'Large Button',
    variant: 'primary',
    size: 'lg',
  },
};

// States
export const Loading: Story = {
  args: {
    children: 'Loading',
    variant: 'primary',
    loading: true,
  },
};

export const Disabled: Story = {
  args: {
    children: 'Disabled',
    variant: 'primary',
    disabled: true,
  },
};

export const FullWidth: Story = {
  args: {
    children: 'Full Width Button',
    variant: 'primary',
    fullWidth: true,
  },
};

// Showcase all combinations
export const AllVariantsSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h3 style={{ marginBottom: '16px' }}>Primary Variant</h3>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <PillButton variant="primary" size="sm">Small</PillButton>
          <PillButton variant="primary" size="md">Medium</PillButton>
          <PillButton variant="primary" size="lg">Large</PillButton>
        </div>
      </div>
      
      <div>
        <h3 style={{ marginBottom: '16px' }}>Secondary Variant</h3>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <PillButton variant="secondary" size="sm">Small</PillButton>
          <PillButton variant="secondary" size="md">Medium</PillButton>
          <PillButton variant="secondary" size="lg">Large</PillButton>
        </div>
      </div>
      
      <div>
        <h3 style={{ marginBottom: '16px' }}>Ghost Variant</h3>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <PillButton variant="ghost" size="sm">Small</PillButton>
          <PillButton variant="ghost" size="md">Medium</PillButton>
          <PillButton variant="ghost" size="lg">Large</PillButton>
        </div>
      </div>
      
      <div>
        <h3 style={{ marginBottom: '16px' }}>CTA Variant</h3>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <PillButton variant="cta" size="sm">Small</PillButton>
          <PillButton variant="cta" size="md">Medium</PillButton>
          <PillButton variant="cta" size="lg">Large</PillButton>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All 12 combinations of variants and sizes (4 variants × 3 sizes)',
      },
    },
  },
};

// Korean text examples
export const KoreanText: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
      <PillButton variant="primary">가입하기</PillButton>
      <PillButton variant="secondary">자세히 보기</PillButton>
      <PillButton variant="ghost">취소</PillButton>
      <PillButton variant="cta">지금 시작하기</PillButton>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Examples with Korean text to ensure proper font rendering',
      },
    },
  },
};