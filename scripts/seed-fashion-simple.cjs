// Simple seed script for Fashion template
const fs = require('fs');
const path = require('path');

// Sample data
const categories = [
  {
    id: 'cat-1',
    name: 'Clothing',
    slug: 'clothing',
    description: 'Stylish clothing for men and women',
    sortOrder: 1,
    isActive: true,
  },
  {
    id: 'cat-2',
    name: 'Accessories',
    slug: 'accessories',
    description: 'Fashion accessories and jewelry',
    sortOrder: 2,
    isActive: true,
  },
  {
    id: 'cat-3',
    name: 'Footwear',
    slug: 'footwear',
    description: 'Shoes and footwear collection',
    sortOrder: 3,
    isActive: true,
  },
];

const products = [
  {
    id: 'prod-1',
    name: 'Elegant Summer Dress',
    description: 'Beautiful floral summer dress perfect for any occasion. Made from high-quality cotton fabric with a comfortable fit.',
    price: 49.99,
    comparePrice: 69.99,
    images: [
      'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=800&h=1000&fit=crop',
      'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=800&h=1000&fit=crop',
    ],
    categoryId: 'cat-1',
    sku: 'SUMMER-DRESS-001',
    inventory: 25,
    status: 'ACTIVE',
    tags: ['summer', 'dress', 'floral', 'women'],
    brand: 'StyleHub',
  },
  {
    id: 'prod-2',
    name: 'Classic Denim Jacket',
    description: 'Timeless denim jacket that pairs well with any outfit. Premium quality denim with classic styling.',
    price: 79.99,
    comparePrice: 99.99,
    images: [
      'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&h=1000&fit=crop',
    ],
    categoryId: 'cat-1',
    sku: 'DENIM-JACKET-001',
    inventory: 15,
    status: 'ACTIVE',
    tags: ['denim', 'jacket', 'casual', 'men', 'women'],
    brand: 'DenimCraft',
  },
  {
    id: 'prod-3',
    name: 'Elegant Gold Necklace',
    description: 'Beautiful gold-plated necklace with pendant. Perfect accessory for formal events and special occasions.',
    price: 39.99,
    comparePrice: 59.99,
    images: [
      'https://images.unsplash.com/photo-1599687351727-7f69542d1b56?w=800&h=1000&fit=crop',
    ],
    categoryId: 'cat-2',
    sku: 'GOLD-NECKLACE-001',
    inventory: 30,
    status: 'ACTIVE',
    tags: ['gold', 'necklace', 'jewelry', 'women', 'formal'],
    brand: 'GoldenGlam',
  },
  {
    id: 'prod-4',
    name: 'Premium Running Shoes',
    description: 'High-performance running shoes with advanced cushioning technology. Perfect for daily training and marathons.',
    price: 129.99,
    comparePrice: 159.99,
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=1000&fit=crop',
    ],
    categoryId: 'cat-3',
    sku: 'RUNNING-SHOES-001',
    inventory: 20,
    status: 'ACTIVE',
    tags: ['running', 'shoes', 'sports', 'men', 'women'],
    brand: 'SpeedFit',
  },
];

// Save to JSON files for the Fashion template to use
const dataDir = path.join(__dirname, '..', 'templates', 'fashion', 'data');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

fs.writeFileSync(
  path.join(dataDir, 'categories.json'),
  JSON.stringify(categories, null, 2)
);

fs.writeFileSync(
  path.join(dataDir, 'products.json'),
  JSON.stringify(products, null, 2)
);

console.log('Fashion template seed data created successfully!');
console.log(`Categories: ${categories.length}`);
console.log(`Products: ${products.length}`);
console.log(`Data saved to: ${dataDir}`);