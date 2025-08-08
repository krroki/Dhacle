import type { Meta, StoryObj } from '@storybook/react';
import { PillButton } from './PillButton';

const meta: Meta<typeof PillButton> = {
  title: 'Components/PillButton',
  component: PillButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'ghost', 'cta'],
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
    },
    disabled: {
      control: { type: 'boolean' },
    },
    loading: {
      control: { type: 'boolean' },
    },
    children: {
      control: { type: 'text' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Primary variant stories
export const Primary: Story = {
  args: {
    variant: 'primary',
    size: 'md',
    children: 'Primary Button',
  },
};

export const PrimarySmall: Story = {
  args: {
    variant: 'primary',
    size: 'sm',
    children: 'Small Primary',
  },
};

export const PrimaryLarge: Story = {
  args: {
    variant: 'primary',
    size: 'lg',
    children: 'Large Primary',
  },
};

// Secondary variant stories
export const Secondary: Story = {
  args: {
    variant: 'secondary',
    size: 'md',
    children: 'Secondary Button',
  },
};

export const SecondaryWithIcon: Story = {
  args: {
    variant: 'secondary',
    size: 'md',
    children: '💼 With Icon',
  },
};

// Ghost variant stories
export const Ghost: Story = {
  args: {
    variant: 'ghost',
    size: 'md',
    children: 'Ghost Button',
  },
};

export const GhostSmall: Story = {
  args: {
    variant: 'ghost',
    size: 'sm',
    children: 'Small Ghost',
  },
};

// CTA variant stories
export const CTA: Story = {
  args: {
    variant: 'cta',
    size: 'md',
    children: 'Get Started',
  },
};

export const CTALarge: Story = {
  args: {
    variant: 'cta',
    size: 'lg',
    children: 'Start Free Trial',
  },
};

// Loading states
export const LoadingPrimary: Story = {
  args: {
    variant: 'primary',
    size: 'md',
    loading: true,
    children: 'Loading...',
  },
};

export const LoadingSecondary: Story = {
  args: {
    variant: 'secondary',
    size: 'md',
    loading: true,
    children: 'Processing...',
  },
};

// Disabled states
export const DisabledPrimary: Story = {
  args: {
    variant: 'primary',
    size: 'md',
    disabled: true,
    children: 'Disabled',
  },
};

export const DisabledGhost: Story = {
  args: {
    variant: 'ghost',
    size: 'md',
    disabled: true,
    children: 'Disabled Ghost',
  },
};

// Full width
export const FullWidth: Story = {
  args: {
    variant: 'primary',
    size: 'md',
    fullWidth: true,
    children: 'Full Width Button',
  },
  parameters: {
    layout: 'padded',
  },
};

// Long text
export const LongText: Story = {
  args: {
    variant: 'primary',
    size: 'md',
    children: 'This is a button with very long text content',
  },
};

// All variants showcase
export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
      <PillButton variant="primary">Primary</PillButton>
      <PillButton variant="secondary">Secondary</PillButton>
      <PillButton variant="ghost">Ghost</PillButton>
      <PillButton variant="cta">Call to Action</PillButton>
    </div>
  ),
};

// All sizes showcase
export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
      <PillButton size="sm">Small</PillButton>
      <PillButton size="md">Medium</PillButton>
      <PillButton size="lg">Large</PillButton>
    </div>
  ),
};

// Interactive states
export const InteractiveStates: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
      <PillButton>Normal</PillButton>
      <PillButton disabled>Disabled</PillButton>
      <PillButton loading>Loading</PillButton>
    </div>
  ),
};