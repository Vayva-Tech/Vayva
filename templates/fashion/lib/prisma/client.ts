// Mock Prisma client for development
// This will be replaced with a real Prisma client when a database is connected

type User = {
  id: string;
  email: string;
  password?: string;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
};

type Product = {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  categoryId?: string;
  storeId?: string;
  createdAt: Date;
  updatedAt: Date;
};

type Category = {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
};

type Cart = {
  id: string;
  userId?: string;
  sessionId?: string;
  items: CartItem[];
  createdAt: Date;
  updatedAt: Date;
};

type CartItem = {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
};

type Order = {
  id: string;
  userId?: string;
  sessionId?: string;
  total: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
};

class MockPrismaClient {
  user = {
    findUnique: async ({ where }: { where: { email: string } }) => {
      // Mock user data
      if (where.email === 'test@example.com') {
        return {
          id: '1',
          email: 'test@example.com',
          password: '$2a$10$abcdefghijklmnopqrstuv', // bcrypt hash of 'password'
          name: 'Test User',
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }
      return null;
    },
    create: async ({ data }: { data: Partial<User> }) => {
      return {
        id: '1',
        email: data.email,
        name: data.name,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    },
  };

  product = {
    findMany: async () => {
      // Mock product data
      return [
        {
          id: '1',
          name: 'Summer Dress',
          description: 'Beautiful summer dress',
          price: 49.99,
          imageUrl: 'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3',
          categoryId: '1',
          storeId: '1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          name: 'Denim Jacket',
          description: 'Classic denim jacket',
          price: 79.99,
          imageUrl: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246',
          categoryId: '1',
          storeId: '1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
    },
    findUnique: async ({ where }: { where: { id: string } }) => {
      // Mock single product
      return {
        id: where.id,
        name: 'Summer Dress',
        description: 'Beautiful summer dress',
        price: 49.99,
        imageUrl: 'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3',
        categoryId: '1',
        storeId: '1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    },
  };

  category = {
    findMany: async () => {
      // Mock category data
      return [
        {
          id: '1',
          name: 'Clothing',
          slug: 'clothing',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          name: 'Accessories',
          slug: 'accessories',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
    },
  };

  cart = {
    findUnique: async ({ where }: { where: { id: string } }) => {
      // Mock cart data
      return {
        id: where.id,
        userId: '1',
        sessionId: null,
        items: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    },
    create: async ({ data }: { data: Partial<Cart> }) => {
      return {
        id: '1',
        userId: data.userId,
        sessionId: data.sessionId,
        items: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    },
  };

  cartItem = {
    create: async ({ data }: { data: Partial<CartItem> }) => {
      return {
        id: '1',
        cartId: data.cartId,
        productId: data.productId,
        quantity: data.quantity,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    },
  };

  order = {
    create: async ({ data }: { data: Partial<Order> }) => {
      return {
        id: '1',
        userId: data.userId,
        sessionId: data.sessionId,
        total: data.total,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    },
  };
}

export const prisma = new MockPrismaClient();

export type { User, Product, Category, Cart, CartItem, Order };