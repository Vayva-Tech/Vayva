"use client";

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ImagePlus, Eye } from "lucide-react";

interface Lookbook {
  id: string;
  name: string;
  images: string[];
  isPublished: boolean;
  products: Array<{
    product: {
      id: string;
      title: string;
      price: number;
    };
  }>;
}

export const VisualMerchandisingWidget: React.FC = () => {
  const { data: lookbooks, isLoading } = useQuery<Lookbook[]>({
    queryKey: ['lookbooks'],
    queryFn: async () => {
      const res = await fetch('/api/fashion/lookbooks?includeUnpublished=true');
      const data = await res.json();
      return data.lookbooks;
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Visual Merchandising Board</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Visual Merchandising Board</CardTitle>
        <Button size="sm" className="gap-2">
          <ImagePlus className="w-4 h-4" />
          Create Lookbook
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {lookbooks?.map((lookbook) => (
            <div
              key={lookbook.id}
              className="group relative rounded-lg overflow-hidden border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="aspect-video bg-gray-100 relative">
                {lookbook.images[0] ? (
                  <img
                    src={lookbook.images[0]}
                    alt={lookbook.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <ImagePlus className="w-8 h-8" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button size="sm" variant="secondary" className="gap-1">
                    <Eye className="w-4 h-4" />
                    View
                  </Button>
                </div>
              </div>
              <div className="p-3">
                <h4 className="font-medium text-sm truncate">{lookbook.name}</h4>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-gray-500">
                    {lookbook.products.length} products
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      lookbook.isPublished
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {lookbook.isPublished ? 'Published' : 'Draft'}
                  </span>
                </div>
              </div>
            </div>
          ))}
          {(!lookbooks || lookbooks.length === 0) && (
            <div className="col-span-2 text-center py-8 text-gray-500">
              <ImagePlus className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No lookbooks yet</p>
              <p className="text-sm">Create your first lookbook to showcase products</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
