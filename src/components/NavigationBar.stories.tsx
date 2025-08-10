import type { Meta, StoryObj } from '@storybook/react';
import NavigationBar from './NavigationBar';

const meta: Meta<typeof NavigationBar> = {
  title: 'Components/NavigationBar',
  component: NavigationBar,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    currentPath: {
      control: { type: 'text' },
    },
    isLoggedIn: {
      control: { type: 'boolean' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Default state - not logged in
export const Default: Story = {
  args: {
    currentPath: '/',
    isLoggedIn: false,
  },
};

// Logged in state
export const LoggedIn: Story = {
  args: {
    currentPath: '/',
    isLoggedIn: true,
  },
};

// Different pages
export const OnToolsPage: Story = {
  args: {
    currentPath: '/tools',
    isLoggedIn: false,
  },
};

export const OnResourcesPage: Story = {
  args: {
    currentPath: '/resources',
    isLoggedIn: false,
  },
};

export const OnCommunityPage: Story = {
  args: {
    currentPath: '/community',
    isLoggedIn: false,
  },
};

// Mobile view
export const Mobile: Story = {
  args: {
    currentPath: '/',
    isLoggedIn: false,
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};