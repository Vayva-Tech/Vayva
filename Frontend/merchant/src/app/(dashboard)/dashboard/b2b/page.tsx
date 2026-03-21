'use client';

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, CreditCard, ClipboardList, ArrowRight } from "lucide-react";

export default function B2BDashboardPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">B2B Wholesale</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quotes</CardTitle>
            <FileText className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-500">
              Create and manage B2B quotes for wholesale customers
            </p>
            <Link href="/dashboard/b2b/quotes" className="mt-4 block">
              <Button variant="outline" className="w-full">
                View Quotes
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credit Accounts</CardTitle>
            <CreditCard className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-500">
              Manage customer credit lines and payment terms
            </p>
            <Link href="/dashboard/b2b/credit-accounts" className="mt-4 block">
              <Button variant="outline" className="w-full">
                View Credit Accounts
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Requisitions</CardTitle>
            <ClipboardList className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-500">
              Handle purchase requisitions from B2B customers
            </p>
            <Link href="/dashboard/b2b/requisitions" className="mt-4 block">
              <Button variant="outline" className="w-full">
                View Requisitions
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
