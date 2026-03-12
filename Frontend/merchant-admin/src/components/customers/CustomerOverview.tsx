import React, { useMemo } from "react";
import Link from "next/link";
import { Customer, CustomerStatus } from "@vayva/shared";
import { Icon } from "@vayva/ui";

interface CustomerOverviewProps {
  customers: Customer[];
}

export const CustomerOverview = ({ customers }: CustomerOverviewProps) => {
  const { total, returning, newCustomers, topCustomer } = useMemo(() => {
    const total = customers.length;
    const returning = customers.filter(
      (c) =>
        c.status === CustomerStatus.RETURNING ||
        c.status === CustomerStatus.VIP,
    ).length;
    const newCustomers = customers.filter(
      (c) => c.status === CustomerStatus.NEW,
    ).length;
    // Test sort by spend for 'Top'
    const topCustomer = [...customers].sort(
      (a, b) => b.totalSpend - a.totalSpend,
    )[0];

    return { total, returning, newCustomers, topCustomer };
  }, [customers]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div className="bg-background border border-border rounded-xl p-4 flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow">
        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
          <Icon name="Users" size={20} />
        </div>
        <div>
          <p className="text-xs text-text-tertiary">Total Customers</p>
          <p className="font-bold text-lg text-text-primary">{total}</p>
        </div>
      </div>

      <div className="bg-background border border-border rounded-xl p-4 flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow">
        <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
          <Icon name="Repeat" size={20} />
        </div>
        <div>
          <p className="text-xs text-text-tertiary">Repeat Customers</p>
          <p className="font-bold text-lg text-text-primary">{returning}</p>
        </div>
      </div>

      <div className="bg-background border border-border rounded-xl p-4 flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow">
        <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
          <Icon name="UserPlus" size={20} />
        </div>
        <div>
          <p className="text-xs text-text-tertiary">New this week</p>
          <p className="font-bold text-lg text-text-primary">{newCustomers}</p>
        </div>
      </div>

      {topCustomer && (
        <Link
          href={`/dashboard/customers/${topCustomer.id}`}
          className="bg-background border border-border rounded-xl p-4 flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer block"
        >
          <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
            <Icon name="Crown" size={20} />
          </div>
          <div>
            <p className="text-xs text-text-tertiary">Top Customer</p>
            <p className="font-bold text-sm text-text-primary truncate max-w-[120px]">
              {topCustomer.name}
            </p>
          </div>
        </Link>
      )}
    </div>
  );
};
