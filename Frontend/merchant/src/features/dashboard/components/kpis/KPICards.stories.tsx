/**
 * KPICard Stories for Storybook
 */

import type { Meta, StoryObj } from '@storybook/react';
import { KPICard, RevenueKPICard, OrdersKPICard, CustomersKPICard } from '../KPICards';

const meta = {
  title: 'Dashboard/KPICard',
  component: KPICard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
    value: { control: 'number' },
    change: { control: 'number' },
    icon: { control: 'text' },
    loading: { control: 'boolean' },
  },
} satisfies Meta<typeof KPICard>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default KPI Card
export const Default: Story = {
  args: {
    title: 'Total Revenue',
    value: 12450,
    change: 12.5,
    icon: 'DollarSign',
  },
};

// Positive Growth
export const PositiveGrowth: Story = {
  args: {
    title: 'Orders',
    value: 856,
    change: 23.8,
    icon: 'ShoppingCart',
  },
};

// Negative Decline
export const NegativeDecline: Story = {
  args: {
    title: 'Customers',
    value: 234,
    change: -5.3,
    icon: 'Users',
  },
};

// Loading State
export const Loading: Story = {
  args: {
    title: 'Revenue',
    value: 0,
    loading: true,
  },
};

// No Change
export const NoChange: Story = {
  args: {
    title: 'Conversion Rate',
    value: 3.2,
    change: 0,
  },
};

// Revenue KPI Card (Specialized)
export const RevenueCard: Story = {
  render: () => <RevenueKPICard title="Monthly Revenue" value={45000} change={8.7} />,
};

// Orders KPI Card (Specialized)
export const OrdersCard: Story = {
  render: () => <OrdersKPICard title="Total Orders" value={1250} change={15.2} />,
};

// Customers KPI Card (Specialized)
export const CustomersCard: Story = {
  render: () => <CustomersKPICard title="Active Customers" value={890} change={-2.1} />,
};
