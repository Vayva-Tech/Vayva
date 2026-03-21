"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Customer } from "@vayva/shared";
import { CustomerList } from "./CustomerList";
import { CustomerOverview } from "./CustomerOverview";
import { CustomerDrawer } from "./CustomerDrawer";
import { Button, Icon, Input, Modal } from "@vayva/ui";
import { CustomerForm } from "./CustomerForm";

interface CustomerListContainerProps {
  customers: Customer[];
}

export const CustomerListContainer = ({
  customers,
}: CustomerListContainerProps) => {
  const router = useRouter();
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );
  const [search, setSearch] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.email || "").toLowerCase().includes(search.toLowerCase()) ||
      (c.phone && c.phone.includes(search)),
  );

  return (
    <div className="space-y-6">
      {/* Live region for screen reader announcements */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {isCreateModalOpen && <p>Creating new customer...</p>}
      </div>

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Customers</h1>
          <p className="text-gray-400 text-sm">
            View and manage your customer base
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Icon name="Plus" className="mr-2" size={16} /> Add Customer
        </Button>
      </div>

      <CustomerOverview customers={customers} />

      <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div className="relative max-w-sm w-full">
            <Icon
              name="Search"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={16}
            />
            <Input type="text"
              placeholder="Search customers..."
              className="w-full pl-10 pr-4 py-2 border border-gray-100 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSearch(e.target.value)
              }
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.refresh()}
            >
              <Icon name="RefreshCw" className="mr-2" size={14} /> Refresh
            </Button>
          </div>
        </div>

        <CustomerList
          customers={filteredCustomers}
          isLoading={false}
          onSelectCustomer={setSelectedCustomer as any}
        />
      </div>

      <CustomerDrawer
        customerId={selectedCustomer?.id || null}
        isOpen={!!selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
      />

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Add New Customer"
      >
        <CustomerForm onSuccess={() => setIsCreateModalOpen(false)} />
      </Modal>
    </div>
  );
};
