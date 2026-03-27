"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { 
  Users, 
  Search, 
  Mail, 
  Phone, 
  DollarSign, 
  Filter,
  Download,
  Award,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiJson } from "@/lib/api-client-shared";
import { logger, formatCurrency } from "@vayva/shared";

interface Donor {
  id: string;
  name?: string;
  email: string;
  phone?: string;
  totalDonated: number;
  donationCount: number;
  tier?: string;
  donorType?: string;
  isRecurringDonor?: boolean;
  createdAt: string;
}

const tierColors: Record<string, string> = {
  bronze: "bg-amber-700",
  silver: "bg-gray-400",
  gold: "bg-yellow-500",
  platinum: "bg-blue-400",
};

export function DonorsList() {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [tierFilter, setTierFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selectedDonors, setSelectedDonors] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchDonors();
  }, []);

  const fetchDonors = async () => {
    try {
      setLoading(true);
      const data = await apiJson<{ data: any[] }>("/api/nonprofit/donors");
      setDonors(data.data || []);
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[FETCH_DONORS_ERROR]", { error: _errMsg });
      toast.error("Failed to load donors");
    } finally {
      setLoading(false);
    }
  };

  const filteredDonors = donors.filter((donor) => {
    const matchesSearch =
      donor.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      donor.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTier = tierFilter === "all" || donor.tier === tierFilter;
    const matchesType = typeFilter === "all" || donor.donorType === typeFilter;
    return matchesSearch && matchesTier && matchesType;
  });

  const handleExportCSV = () => {
    try {
      const headers = [
        "Name",
        "Email",
        "Phone",
        "Total Donated",
        "Donation Count",
        "Tier",
        "Type",
        "Recurring",
        "Joined Date",
      ];

      const csvData = filteredDonors.map((donor) => [
        donor.name || "Anonymous",
        donor.email,
        donor.phone || "",
        donor.totalDonated.toFixed(2),
        donor.donationCount,
        donor.tier || "",
        donor.donorType || "",
        donor.isRecurringDonor ? "Yes" : "No",
        new Date(donor.createdAt).toLocaleDateString(),
      ]);

      const csvContent =
        "data:text/csv;charset=utf-8," +
        [headers.join(","), ...csvData.map((row) => row.join(","))].join("\\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `donors_${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Donors exported successfully!");
    } catch (error: unknown) {
      logger.error("[EXPORT_CSV_ERROR]", { error });
      toast.error("Failed to export donors");
    }
  };

  const handleEmailAll = () => {
    const emails = filteredDonors.map((d) => d.email).join(",");
    window.open(`mailto:${emails}`);
  };

  const handleBulkEmailSelected = () => {
    if (selectedDonors.size === 0) {
      toast.error("Please select at least one donor");
      return;
    }
    const selectedEmails = filteredDonors
      .filter((d) => selectedDonors.has(d.id))
      .map((d) => d.email)
      .join(",");
    window.open(`mailto:${selectedEmails}`);
  };

  const toggleDonorSelection = (donorId: string) => {
    const newSelected = new Set(selectedDonors);
    if (newSelected.has(donorId)) {
      newSelected.delete(donorId);
    } else {
      newSelected.add(donorId);
    }
    setSelectedDonors(newSelected);
  };

  const toggleAllDonors = () => {
    if (selectedDonors.size === filteredDonors.length) {
      setSelectedDonors(new Set());
    } else {
      setSelectedDonors(new Set(filteredDonors.map((d) => d.id)));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto" />
      </div>
    );
  }

  const totalRaised = donors.reduce((sum, d) => sum + d.totalDonated, 0);
  const recurringDonors = donors.filter((d) => d.isRecurringDonor).length;
  const averageGift = donors.length > 0 ? totalRaised / donors.length : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Donor Management</h1>
        <div className="flex gap-2">
          {selectedDonors.size > 0 && (
            <Button variant="outline" onClick={handleBulkEmailSelected} className="bg-blue-50">
              <Mail className="h-4 w-4 mr-2" />
              Email Selected ({selectedDonors.size})
            </Button>
          )}
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={handleEmailAll}>
            <Mail className="h-4 w-4 mr-2" />
            Email All
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Donors</p>
                <p className="text-2xl font-bold">{donors.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Raised</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totalRaised)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Average Gift</p>
                <p className="text-2xl font-bold">{formatCurrency(averageGift)}</p>
              </div>
              <Award className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Recurring Donors</p>
                <p className="text-2xl font-bold text-blue-600">{recurringDonors}</p>
              </div>
              <Mail className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Advanced Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={tierFilter} onValueChange={(value) => setTierFilter(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by tier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tiers</SelectItem>
                <SelectItem value="bronze">Bronze</SelectItem>
                <SelectItem value="silver">Silver</SelectItem>
                <SelectItem value="gold">Gold</SelectItem>
                <SelectItem value="platinum">Platinum</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="individual">Individual</SelectItem>
                <SelectItem value="corporate">Corporate</SelectItem>
                <SelectItem value="foundation">Foundation</SelectItem>
                <SelectItem value="organization">Organization</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Donors List */}
      <div className="space-y-3">
        {filteredDonors.length > 0 && (
          <div className="flex items-center gap-2 px-2">
            <input
              type="checkbox"
              checked={selectedDonors.size === filteredDonors.length}
              onChange={toggleAllDonors}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-600">
              Select All ({filteredDonors.length})
            </span>
            {selectedDonors.size > 0 && (
              <Badge variant="secondary" className="ml-auto">
                {selectedDonors.size} selected
              </Badge>
            )}
          </div>
        )}

        {filteredDonors.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500">No donors found</p>
            </CardContent>
          </Card>
        ) : (
          filteredDonors.map((donor) => (
            <Card
              key={donor.id}
              className={`hover:shadow-md transition-shadow cursor-pointer ${
                selectedDonors.has(donor.id) ? "ring-2 ring-blue-500" : ""
              }`}
              onClick={() => window.location.href = `/dashboard/nonprofit/donors/${donor.id}`}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <input
                      type="checkbox"
                      checked={selectedDonors.has(donor.id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        toggleDonorSelection(donor.id);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                      {(donor.name || donor.email).charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold truncate">{donor.name || "Anonymous"}</h3>
                        {donor.tier && (
                          <Badge className={tierColors[donor.tier] || "bg-gray-500"}>
                            <Award className="h-3 w-3 mr-1" />
                            {donor.tier}
                          </Badge>
                        )}
                        {donor.isRecurringDonor && (
                          <Badge variant="secondary">🔄 Recurring</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 truncate">{donor.email}</p>
                      {donor.phone && (
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                          <Phone className="h-3 w-3" />
                          {donor.phone}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-4">
                    <p className="text-lg font-bold text-green-600">
                      {formatCurrency(donor.totalDonated)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {donor.donationCount} donation{donor.donationCount !== 1 ? "s" : ""}
                    </p>
                    {donor.donorType && (
                      <p className="text-xs text-gray-500 capitalize mt-1">{donor.donorType}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
