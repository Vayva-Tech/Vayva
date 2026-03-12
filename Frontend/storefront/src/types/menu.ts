export interface Delivery {
  id: string;
  date: string;
  mealIds: string[];
  isDelivered: boolean;
}

export interface Meal {
  id: string;
  name: string;
  title: { tr: string; en: string };
  subtitle?: { tr?: string; en?: string };
  description?: string;
  price: number;
  image?: string;
  category?: string;
  isAvailable?: boolean;
  isPro?: boolean;
  tags: {
    prepTime: number;
    category: string;
    calories?: number;
    kcal: number;
  };
  ingredients: { name: string }[];
}

export interface Week {
  id: string;
  name: string;
  label?: { tr?: string; en?: string };
  days: string[];
  isLocked?: boolean;
  deliveryDate?: string;
  cutoffDate?: string;
}
