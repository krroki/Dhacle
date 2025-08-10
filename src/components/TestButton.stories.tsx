import type { Meta, StoryObj } from '@storybook/react';

// 아주 간단한 버튼 컴포넌트
const TestButton = ({ label = 'Click me' }: { label?: string }) => (
  <button style={{ 
    padding: '10px 20px', 
    backgroundColor: '#007bff', 
    color: 'white', 
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer'
  }}>
    {label}
  </button>
);

const meta: Meta<typeof TestButton> = {
  title: 'Test/TestButton',
  component: TestButton,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Test Button',
  },
};

export const Another: Story = {
  args: {
    label: 'Another Test',
  },
};