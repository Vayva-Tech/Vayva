import type { Meta, StoryObj } from '@storybook/react';
import { TravelDashboard } from '../src/components/dashboard';

const meta: Meta<typeof TravelDashboard> = {
  title: 'Industry/Travel/Dashboard',
  component: TravelDashboard,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    theme: {
      control: 'radio',
      options: ['ocean-breeze', 'tropical-sunset', 'mountain-retreat', 'urban-chic', 'coastal-luxury'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof TravelDashboard>;

export const Default: Story = {
  args: {
    theme: 'ocean-breeze',
  },
};

export const TropicalSunset: Story = {
  args: {
    theme: 'tropical-sunset',
  },
};

export const MountainRetreat: Story = {
  args: {
    theme: 'mountain-retreat',
  },
};

export const UrbanChic: Story = {
  args: {
    theme: 'urban-chic',
  },
};

export const CoastalLuxury: Story = {
  args: {
    theme: 'coastal-luxury',
  },
};