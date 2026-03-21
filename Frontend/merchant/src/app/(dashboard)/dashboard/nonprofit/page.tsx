'use client';

import { motion } from 'framer-motion';
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Target, Users, DollarSign, ArrowRight } from "lucide-react";

export default function NonprofitDashboardPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="container mx-auto py-6 space-y-6"
    >
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Nonprofit Management</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Campaigns</CardTitle>
            <Target className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-500">
              Manage fundraising campaigns and appeals
            </p>
            <Link href="/dashboard/nonprofit/campaigns" className="mt-4 block">
              <Button variant="outline" className="w-full">
                View Campaigns
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Donations</CardTitle>
            <Heart className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-500">
              Track donations and donor contributions
            </p>
            <Link href="/dashboard/nonprofit/donations" className="mt-4 block">
              <Button variant="outline" className="w-full">
                View Donations
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Volunteers</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-500">
              Manage volunteer roster and shifts
            </p>
            <Link href="/dashboard/nonprofit/volunteers" className="mt-4 block">
              <Button variant="outline" className="w-full">
                View Volunteers
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Grants</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-500">
              Track grants and fund allocation
            </p>
            <Link href="/dashboard/nonprofit/grants" className="mt-4 block">
              <Button variant="outline" className="w-full">
                View Grants
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
