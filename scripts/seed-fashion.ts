import { prisma } from '../packages/prisma/src/client';

async function seedFashionData() {
  console.log('Seeding Fashion template data...');

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'clothing' },
      update: {},
      create: {
        name: 'Clothing',
        slug: 'clothing',
        description: 'Stylish clothing for men and women',
        sortOrder: 1,
        isActive: true,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'accessories' },
      update: {},
      create: {
        name: 'Accessories',
        slug: 'accessories',
        description: 'Fashion accessories and jewelry',
        sortOrder: 2,
        isActive: true,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'footwear' },
      update: {},
      create: {
        name: 'Footwear',
        slug: 'footwear',
        description: 'Shoes and footwear collection',
        sortOrder: 3,
        isActive: true,
      },
    }),
  ]);

  console.log(`Created/updated ${categories.length} categories`);

  // Create products
  const products = await Promise.all([
    prisma.product.upsert({
      where: { sku: 'SUMMER-DRESS-001' },
      update: {},
      create: {
        name: 'Elegant Summer Dress',
        description: 'Beautiful floral summer dress perfect for any occasion. Made from high-quality cotton fabric with a comfortable fit.',
        price: 49.99,
        comparePrice: 69.99,
        images: [
          'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=800&h=1000&fit=crop',
          'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=800&h=1000&fit=crop',
        ],
        categoryId: categories[0].id,
        sku: 'SUMMER-DRESS-001',
        inventory: 25,
        status: 'ACTIVE',
        tags: ['summer', 'dress', 'floral', 'women'],
        brand: 'StyleHub',
      },
    }),
    prisma.product.upsert({
      where: { sku: 'DENIM-JACKET-001' },
      update: {},
      create: {
        name: 'Classic Denim Jacket',
        description: 'Timeless denim jacket that pairs well with any outfit. Premium quality denim with classic styling.',
        price: 79.99,
        comparePrice: 99.99,
        images: [
          'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&h=1000&fit=crop',
          'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=800&h=1000&fit=crop',
        ],
        categoryId: categories[0].id,
        sku: 'DENIM-JACKET-001',
        inventory: 15,
        status: 'ACTIVE',
        tags: ['denim', 'jacket', 'casual', 'men', 'women'],
        brand: 'DenimCraft',
      },
    }),
    prisma.product.upsert({
      where: { sku: 'GOLD-NECKLACE-001' },
      update: {},
      create: {
        name: 'Elegant Gold Necklace',
        description: 'Beautiful gold-plated necklace with pendant. Perfect accessory for formal events and special occasions.',
        price: 39.99,
        comparePrice: 59.99,
        images: [
          'https://images.unsplash.com/photo-1599687351727-7f69542d1b56?w=800&h=1000&fit=crop',
          'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=1000&fit=crop',
        ],
        categoryId: categories[1].id,
        sku: 'GOLD-NECKLACE-001',
        inventory: 30,
        status: 'ACTIVE',
        tags: ['gold', 'necklace', 'jewelry', 'women', 'formal'],
        brand: 'GoldenGlam',
      },
    }),
    prisma.product.upsert({
      where: { sku: 'RUNNING-SHOES-001' },
      update: {},
      create: {
        name: 'Premium Running Shoes',
        description: 'High-performance running shoes with advanced cushioning technology. Perfect for daily training and marathons.',
        price: 129.99,
        comparePrice: 159.99,
        images: [
          'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=1000&fit=crop',
          'https://images.unsplash.com/photo-1543508282-6319a3e2621f?w=800&h=1000&fit=crop',
        ],
        categoryId: categories[2].id,
        sku: 'RUNNING-SHOES-001',
        inventory: 20,
        status: 'ACTIVE',
        tags: ['running', 'shoes', 'sports', 'men', 'women'],
        brand: 'SpeedFit',
      },
    }),
    prisma.product.upsert({
      where: { sku: 'CASUAL-SHIRTS-001' },
      update: {},
      create: {
        name: 'Casual Cotton Shirts',
        description: 'Comfortable cotton shirts for everyday wear. Available in multiple colors and sizes.',
        price: 29.99,
        comparePrice: 39.99,
        images: [
          'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=1000&fit=crop',
          'https://images.unsplash.com/photo-1583743814966-8936f7b144ba?w=800&h=1000&fit=crop',
        ],
        categoryId: categories[0].id,
        sku: 'CASUAL-SHIRTS-001',
        inventory: 40,
        status: 'ACTIVE',
        tags: ['shirt', 'casual', 'cotton', 'men'],
        brand: 'ComfortWear',
      },
    }),
  ]);

  console.log(`Created/updated ${products.length} products`);

  // Create a sample user
  const user = await prisma.user.upsert({
    where: { email: 'customer@fashion.com' },
    update: {},
    create: {
      email: 'customer@fashion.com',
      name: 'Fashion Customer',
      password: '$2a$10$abcdefghijklmnopqrstuv', // Mock hashed password
    },
  });

  console.log(`Created/updated user: ${user.email}`);

  console.log('Fashion template seeding completed!');
}

seedFashionData()
  .catch((error) => {
    console.error('Seeding error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });