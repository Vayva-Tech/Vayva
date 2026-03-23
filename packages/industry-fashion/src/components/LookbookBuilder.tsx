// @ts-nocheck
'use client';

import React, { useState } from 'react';
import { GlassPanel, Button } from '@vayva/ui/components/fashion';

interface LookbookItem {
  productId: string;
  name: string;
  imageUrl: string;
  price: number;
  category: string;
}

interface LookbookPage {
  id: string;
  title: string;
  layout: 'single' | 'double' | 'grid';
  items: LookbookItem[];
  background: string;
}

export interface LookbookBuilderProps {
  lookbookId?: string;
  initialPages?: LookbookPage[];
  availableProducts?: LookbookItem[];
  onSave?: (lookbook: LookbookPage[]) => void;
  onPublish?: (lookbook: LookbookPage[]) => void;
}

export const LookbookBuilder: React.FC<LookbookBuilderProps> = ({
  lookbookId,
  initialPages = [],
  availableProducts = [],
  onSave,
  onPublish,
}) => {
  const [pages, setPages] = useState<LookbookPage[]>(initialPages);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [selectedProduct, setSelectedProduct] = useState<LookbookItem | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const addPage = () => {
    const newPage: LookbookPage = {
      id: `page-${Date.now()}`,
      title: `Page ${pages.length + 1}`,
      layout: 'single',
      items: [],
      background: '#ffffff',
    };
    setPages([...pages, newPage]);
    setCurrentPage(pages.length);
  };

  const removePage = (pageIndex: number) => {
    if (pages.length <= 1) return;
    const newPages = pages.filter((_, i) => i !== pageIndex);
    setPages(newPages);
    if (currentPage >= pageIndex && currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const addToPage = (product: LookbookItem) => {
    if (!pages[currentPage]) return;
    
    const updatedPages = [...pages];
    const page = { ...updatedPages[currentPage] };
    
    if (page.items.length < (page.layout === 'grid' ? 6 : page.layout === 'double' ? 2 : 1)) {
      page.items = [...page.items, product];
      updatedPages[currentPage] = page;
      setPages(updatedPages);
    }
  };

  const removeFromPage = (itemIndex: number) => {
    const updatedPages = [...pages];
    const page = { ...updatedPages[currentPage] };
    page.items = page.items.filter((_, i) => i !== itemIndex);
    updatedPages[currentPage] = page;
    setPages(updatedPages);
  };

  const updateLayout = (layout: LookbookPage['layout']) => {
    const updatedPages = [...pages];
    updatedPages[currentPage] = {
      ...updatedPages[currentPage],
      layout,
    };
    setPages(updatedPages);
  };

  const handleSave = () => {
    onSave?.(pages);
  };

  const handlePublish = () => {
    onPublish?.(pages);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Lookbook Builder</h2>
          <p className="text-sm text-white/60 mt-1">Create stunning visual lookbooks</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => setIsPreviewMode(!isPreviewMode)}>
            {isPreviewMode ? 'Edit Mode' : 'Preview'}
          </Button>
          <Button variant="secondary" onClick={handleSave}>
            Save
          </Button>
          <Button variant="primary" onClick={handlePublish}>
            Publish
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Products Panel */}
        {!isPreviewMode && (
          <GlassPanel variant="elevated" className="p-4 lg:col-span-1">
            <h3 className="text-lg font-semibold text-white mb-4">Products</h3>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {availableProducts.map((product) => (
                <button
                  key={product.productId}
                  onClick={() => setSelectedProduct(product)}
                  className={`w-full p-3 rounded-lg border transition-all ${
                    selectedProduct?.productId === product.productId
                      ? 'border-blue-500 bg-blue-500/20'
                      : 'border-white/10 bg-white/5 hover:border-white/30'
                  }`}
                >
                  <div className="aspect-square rounded-md bg-white/10 mb-2 overflow-hidden">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-sm font-medium text-white truncate">{product.name}</div>
                  <div className="text-xs text-white/60">${product.price}</div>
                </button>
              ))}
            </div>
          </GlassPanel>
        )}

        {/* Canvas Area */}
        <div className="lg:col-span-3 space-y-4">
          {/* Page Controls */}
          {!isPreviewMode && (
            <GlassPanel variant="elevated" className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                    disabled={currentPage === 0}
                  >
                    Previous
                  </Button>
                  <span className="text-white font-medium">
                    Page {currentPage + 1} of {pages.length}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(pages.length - 1, currentPage + 1))}
                    disabled={currentPage === pages.length - 1}
                  >
                    Next
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={pages[currentPage]?.layout || 'single'}
                    onChange={(e) => updateLayout(e.target.value as LookbookPage['layout'])}
                    className="bg-white/10 border border-white/20 rounded px-3 py-1 text-sm text-white"
                  >
                    <option value="single">Single</option>
                    <option value="double">Double</option>
                    <option value="grid">Grid</option>
                  </select>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => removePage(currentPage)}
                    disabled={pages.length <= 1}
                  >
                    Remove Page
                  </Button>
                  <Button variant="secondary" size="sm" onClick={addPage}>
                    Add Page
                  </Button>
                </div>
              </div>
            </GlassPanel>
          )}

          {/* Page Canvas */}
          <GlassPanel variant="elevated" className="p-8 min-h-[600px]">
            {pages[currentPage] && (
              <div className="space-y-4">
                <input
                  type="text"
                  value={pages[currentPage].title}
                  onChange={(e) => {
                    const updatedPages = [...pages];
                    updatedPages[currentPage].title = e.target.value;
                    setPages(updatedPages);
                  }}
                  className="w-full bg-transparent text-2xl font-bold text-white border-b border-white/20 pb-2 focus:outline-none focus:border-blue-500"
                  placeholder="Page Title"
                />

                {/* Layout Preview */}
                <div className={`grid gap-4 ${
                  pages[currentPage].layout === 'single' ? 'grid-cols-1' :
                  pages[currentPage].layout === 'double' ? 'grid-cols-2' :
                  'grid-cols-3'
                }`}>
                  {pages[currentPage].items.map((item, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-[3/4] rounded-lg overflow-hidden bg-white/10">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="mt-2">
                        <div className="text-sm font-medium text-white">{item.name}</div>
                        <div className="text-xs text-white/60">${item.price}</div>
                      </div>
                      {!isPreviewMode && (
                        <button
                          onClick={() => removeFromPage(index)}
                          className="absolute top-2 right-2 p-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}

                  {!isPreviewMode && pages[currentPage].items.length < (pages[currentPage].layout === 'grid' ? 6 : pages[currentPage].layout === 'double' ? 2 : 1) && (
                    <div className="border-2 border-dashed border-white/20 rounded-lg flex items-center justify-center min-h-[300px]">
                      {selectedProduct ? (
                        <Button onClick={() => addToPage(selectedProduct)}>
                          Add {selectedProduct.name}
                        </Button>
                      ) : (
                        <div className="text-white/40 text-sm">Select a product to add</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </GlassPanel>

          {/* Page Thumbnails */}
          {!isPreviewMode && (
            <GlassPanel variant="elevated" className="p-4">
              <div className="flex gap-2 overflow-x-auto">
                {pages.map((page, index) => (
                  <button
                    key={page.id}
                    onClick={() => setCurrentPage(index)}
                    className={`flex-shrink-0 w-24 h-32 rounded border transition-all ${
                      index === currentPage
                        ? 'border-blue-500 ring-2 ring-blue-500/50'
                        : 'border-white/10 hover:border-white/30'
                    }`}
                  >
                    <div className="text-xs text-white/60 p-2">{page.title}</div>
                    <div className="bg-white/10 mx-2 rounded aspect-[3/4]" />
                  </button>
                ))}
              </div>
            </GlassPanel>
          )}
        </div>
      </div>
    </div>
  );
};
