'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { logger } from '@/lib/logger';
import { CreditAccount } from '@/types/phase4-industry';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Search, CreditCard, DollarSign, User, Check } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { CreateCreditAccountDialog } from './CreateCreditAccountDialog';

export function CreditAccountsList() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<CreditAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const response = await fetch('/b2b/credit-accounts');
      if (response.ok) {
        const data = await response.json();
        setAccounts(data.accounts || []);
      }
    } catch (error) {
      logger.error('[CreditAccountsList] Failed to fetch:', { error });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAccounts = accounts.filter((account) => {
    const matchesSearch = account.customerId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' ? true : statusFilter === 'active' ? account.isActive : !account.isActive;
    return matchesSearch && matchesStatus;
  });

  const approveAccount = async (id: string) => {
    try {
      const response = await fetch(`/api/b2b/credit-accounts/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve' }),
      });

      if (response.ok) {
        fetchAccounts();
      }
    } catch (error) {
      logger.error('[CreditAccountsList] Failed to approve:', { error });
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading credit accounts...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Credit Accounts</h1>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Credit Account
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search by customer..."
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={(value: string) => setStatusFilter(value as any)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredAccounts.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <CreditCard className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500">No credit accounts found</p>
            </CardContent>
          </Card>
        ) : (
          filteredAccounts.map((account) => (
            <Card key={account.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{account.customerId}</h3>
                      <Badge variant={account.isActive ? 'default' : 'secondary'}>
                        {account.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Credit Limit</p>
                    <p className="text-lg font-semibold">{formatCurrency(account.creditLimit)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Available</p>
                    <p className="text-lg font-semibold text-green-600">
                      {formatCurrency(account.availableCredit)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Balance</p>
                    <p className="text-lg font-semibold text-red-600">
                      {formatCurrency(account.currentBalance)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Terms</p>
                    <p className="text-lg font-semibold">{account.paymentTerms}</p>
                  </div>
                </div>

                {!account.isActive && (
                  <Button
                    className="w-full mt-4"
                    variant="outline"
                    onClick={() => approveAccount(account.id)}
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Approve Account
                  </Button>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <CreateCreditAccountDialog
        open={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSuccess={() => {
          setIsCreateDialogOpen(false);
          fetchAccounts();
        }}
      />
    </div>
  );
}
