'use client';

import { Input } from '@vayva/ui/components/ui/input';
import { Button } from '@vayva/ui/components/ui/button';
import { Search, ScanLine, Trash2 } from 'lucide-react';

interface POSTopBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  barcode: string;
  onBarcodeChange: (value: string) => void;
  cartCount: number;
}

export function POSTopBar({
  searchQuery,
  onSearchChange,
  barcode,
  onBarcodeChange,
  cartCount,
}: POSTopBarProps) {
  return (
    <div className="bg-white border-b border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Point of Sale</h1>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm">
            Keyboard Shortcuts
          </Button>
          <Button variant="ghost" size="sm">
            Help
          </Button>
        </div>
      </div>

      <div className="flex gap-4">
        {/* Barcode Scanner */}
        <div className="flex-1 relative">
          <ScanLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            id="barcode-scanner"
            type="text"
            placeholder="Scan barcode (or type to search)"
            value={barcode}
            onChange={(e) => onBarcodeChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Product Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            type="text"
            placeholder="Search products by name, SKU, or category"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Cart Summary */}
        <div className="flex items-center gap-2 min-w-[200px] justify-end">
          <div className="text-right">
            <div className="text-sm text-gray-600">Items in cart</div>
            <div className="text-lg font-semibold">{cartCount}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
