'use client';

import { useState, useEffect } from 'react';
import { logger } from '@/lib/logger';
import { Donation, DonationType, DonationStatus } from '@/types/phase4-industry';
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
import { 
  Search, 
  Heart, 
  DollarSign, 
  Gift, 
  Calendar, 
  User,
  Filter,
  TrendingUp,
  Download,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

const statusColors: Record<DonationStatus, string> = {
  pending: 'bg-yellow-500',
  completed: 'bg-green-500',
  failed: 'bg-red-500',
  refunded: 'bg-gray-500',
};

const typeIcons: Record<DonationType, typeof Heart> = {
  one_time: Gift,
  recurring: Heart,
  in_kind: Gift,
  memorial: Heart,
  tribute: Heart,
  matching: DollarSign,
  stock: DollarSign,
  grant: DollarSign,
};

export function DonationsList() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<DonationStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<DonationType | 'all'>('all');
  const [dateRangeFilter, setDateRangeFilter] = useState<string>('all');
  const [amountRangeFilter, setAmountRangeFilter] = useState<string>('all');
  const [campaignFilter, setCampaignFilter] = useState<string>('all');

  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    try {
      const response = await fetch('/nonprofit/donations');
      if (response.ok) {
        const data = await response.json();
        setDonations(data.donations || []);
      }
    } catch (error) {
      logger.error('[DonationsList] Failed to fetch:', { error });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDonationClick = (donationId: string) => {
    window.location.href = `/dashboard/nonprofit/donations/${donationId}`;
  };

  const handleExportCSV = () => {
    try {
      const headers = [
        "Date",
        "Donor Name",
        "Donor Email",
        "Amount",
        "Fees",
        "Net Amount",
        "Type",
        "Status",
        "Campaign",
      ];

      const csvData = filteredDonations.map((donation) => [
        new Date((donation as any).donationDate || donation.createdAt).toLocaleDateString(),
        donation.donorName || "Anonymous",
        donation.donorEmail || "",
        donation.amount.toFixed(2),
        ((donation as any).fees || 0).toFixed(2),
        (donation.amount - ((donation as any).fees || 0)).toFixed(2),
        ((donation as any).type || "one_time").replace("_", " "),
        donation.status,
        (donation as any).campaignName || "",
      ]);

      const csvContent =
        "data:text/csv;charset=utf-8," +
        [headers.join(","), ...csvData.map((row) => row.join(","))].join("\\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `donations_${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Donations exported successfully!");
    } catch (error: unknown) {
      logger.error("[EXPORT_CSV_ERROR]", { error });
      toast.error("Failed to export donations");
    }
  };

  const filteredDonations = donations.filter((donation) => {
    const matchesSearch =
      donation.donorName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      donation.donorEmail?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || donation.status === statusFilter;
    const matchesType = typeFilter === 'all' || (donation as any).type === typeFilter;
    
    // Date range filter
    const donationDate = new Date((donation as any).donationDate || donation.createdAt);
    const now = new Date();
    let matchesDate = true;
    if (dateRangeFilter === 'today') {
      matchesDate = donationDate.toDateString() === now.toDateString();
    } else if (dateRangeFilter === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      matchesDate = donationDate >= weekAgo;
    } else if (dateRangeFilter === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      matchesDate = donationDate >= monthAgo;
    } else if (dateRangeFilter === 'year') {
      const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      matchesDate = donationDate >= yearAgo;
    }
    
    // Amount range filter
    let matchesAmount = true;
    if (amountRangeFilter === 'small') {
      matchesAmount = donation.amount < 100;
    } else if (amountRangeFilter === 'medium') {
      matchesAmount = donation.amount >= 100 && donation.amount < 1000;
    } else if (amountRangeFilter === 'large') {
      matchesAmount = donation.amount >= 1000 && donation.amount < 10000;
    } else if (amountRangeFilter === 'major') {
      matchesAmount = donation.amount >= 10000;
    }
    
    // Campaign filter
    const matchesCampaign = campaignFilter === 'all' || 
      ((donation as any).campaignId === campaignFilter || (donation as any).campaignName);
    
    return matchesSearch && matchesStatus && matchesType && matchesDate && matchesAmount && matchesCampaign;
  });

  const totalRaised = filteredDonations.reduce((sum: number, d) => sum + d.amount, 0);
  const totalFees = filteredDonations.reduce((sum: number, d) => sum + ((d as any).fees || 0), 0);
  const netAmount = totalRaised - totalFees;

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading donations...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Donations</h1>
        <Button variant="outline" onClick={handleExportCSV}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-gray-500">Total Raised</p>
            <p className="text-2xl font-bold">{formatCurrency(totalRaised)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-gray-500">Processing Fees</p>
            <p className="text-2xl font-bold text-red-600">-{formatCurrency(totalFees)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-gray-500">Net Amount</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(netAmount)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-gray-500">Total Donations</p>
            <p className="text-2xl font-bold">{filteredDonations.length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Advanced Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search by donor name or email..."
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={(value: string) => setStatusFilter(value as DonationStatus | 'all')}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={(value: string) => setTypeFilter(value as DonationType | 'all')}>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="one_time">One-time</SelectItem>
                <SelectItem value="recurring">Recurring</SelectItem>
                <SelectItem value="in_kind">In-kind</SelectItem>
                <SelectItem value="matching">Matching</SelectItem>
                <SelectItem value="stock">Stock</SelectItem>
                <SelectItem value="grant">Grant</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateRangeFilter} onValueChange={(value: string) => setDateRangeFilter(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
            <Select value={amountRangeFilter} onValueChange={(value: string) => setAmountRangeFilter(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Amount" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Amounts</SelectItem>
                <SelectItem value="small">&lt; $100</SelectItem>
                <SelectItem value="medium">$100 - $999</SelectItem>
                <SelectItem value="large">$1,000 - $9,999</SelectItem>
                <SelectItem value="major">$10,000+</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {filteredDonations.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Heart className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500">No donations found</p>
            </CardContent>
          </Card>
        ) : (
          filteredDonations.map((donation) => {
            const Icon = typeIcons[(donation as any).type as DonationType] || Heart;
            return (
              <Card 
                key={donation.id}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleDonationClick(donation.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                        <Icon className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{donation.donorName || 'Anonymous'}</h3>
                          <Badge className={statusColors[donation.status]}>{donation.status}</Badge>
                        </div>
                        <p className="text-sm text-gray-500">{donation.donorEmail}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold">{formatCurrency(donation.amount)}</p>
                      <p className="text-xs text-gray-500">Fees: {formatCurrency((donation as any).fees || 0)}</p>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t flex items-center gap-4 text-sm">
                    <span className="text-gray-500 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate((donation as any).donationDate || donation.createdAt)}
                    </span>
                    <span className="text-gray-500 capitalize">{((donation as any).type || 'one_time').replace('_', ' ')}</span>
                    {(donation as any).campaignName && (
                      <span className="text-gray-500">Campaign: {(donation as any).campaignName}</span>
                    )}
                  </div>

                  {(donation as any).dedicationName && (
                    <div className="mt-2 text-sm text-gray-500">
                      <span className="font-medium">Dedication:</span> {(donation as any).dedicationName}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
