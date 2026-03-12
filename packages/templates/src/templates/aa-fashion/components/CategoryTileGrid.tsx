import React from "react";
import Link from "next/link";
import Image from "next/image";

interface Category {
  id: string;
  name: string;
  imageUrl: string;
  slug: string;
}

interface CategoryTileGridProps {
  categories: Category[];
}

export const CategoryTileGrid = ({ categories }: CategoryTileGridProps): React.JSX.Element => {
  return (
    <div className="grid grid-cols-2 gap-3 px-4">
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {categories.map((cat: any) => (
        <Link
          key={cat.id}
          href={`/collections/${cat.slug}`}
          className="group block relative overflow-hidden rounded-xl aspect-square bg-background/40 backdrop-blur-sm"
        >
          <Image
            src={cat.imageUrl}
            alt={cat.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
          <div className="absolute bottom-3 left-3">
            <span className="text-white text-sm font-bold drop-shadow-md">
              {cat.name}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
};
