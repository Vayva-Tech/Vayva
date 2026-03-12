import { NextResponse } from "next/server";

// Mock products data - in real implementation, this comes from database
const MOCK_PRODUCTS = [
  {
    id: "1",
    name: "Premium T-Shirt",
    description: "High-quality cotton t-shirt",
    price: 5000,
    images: ["/images/product-1.jpg"],
    category: "clothing",
    inventory: 50,
  },
  {
    id: "2",
    name: "Designer Jeans",
    description: "Comfortable fit jeans",
    price: 15000,
    images: ["/images/product-2.jpg"],
    category: "clothing",
    inventory: 30,
  },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  
  let products = MOCK_PRODUCTS;
  
  if (category) {
    products = products.filter(p => p.category === category);
  }
  
  return NextResponse.json({ products });
}
