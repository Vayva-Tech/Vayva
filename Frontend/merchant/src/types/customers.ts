export interface CustomerListItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  ordersCount: number;
  totalSpent: number;
  lastOrderDate: string;
  address?: string;
}

export interface CustomerDetail extends CustomerListItem {
  avatar?: string;
}

export interface CustomerOrder {
  id: string;
  orderNumber: string;
  date: string;
  total: number;
  status: string;
  itemsCount: number;
}

export interface CustomerNote {
  id: string;
  content: string;
  date: string;
  author: string;
}
