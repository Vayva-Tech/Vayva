"use client";

import { useState, useEffect } from "react";
import { logger } from "@vayva/shared";
import { Card, Input, Button } from "@vayva/ui";
import { Badge } from "@/components/ui/badge";
import {
  Spinner as Loader2,
  ChalkboardTeacher as InstructorIcon,
  Plus,
  MagnifyingGlass as Search,
  Star,
  Clock,
  CurrencyDollar,
  Certificate,
} from "@phosphor-icons/react/ssr";
import { format } from "date-fns";
import Link from "next/link";
import { apiJson } from "@/lib/api-client-shared";

interface Instructor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  bio?: string;
  expertise: string[];
  yearsExperience: number;
  rating: number;
  reviewCount: number;
  hourlyRate?: number;
  isActive: boolean;
  profileImageUrl?: string;
  createdAt: string;
}

interface InstructorsResponse {
  data: Instructor[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export default function InstructorsPage() {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("all");

  useEffect(() => {
    void loadInstructors();
  }, []);

  const loadInstructors = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (activeFilter !== "all") {
        params.append("isActive", activeFilter === "active" ? "true" : "false");
      }

      const data = await apiJson<InstructorsResponse>(
        `/api/education/instructors?${params.toString()}`,
      );
      setInstructors(data.data || []);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error("[INSTRUCTORS_PAGE]", { error: errorMessage });
      setError(errorMessage || "Failed to load instructors");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive
      ? "bg-green-100 text-green-800"
      : "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <InstructorIcon className="w-8 h-8" />
            Instructors
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage instructors and their expertise
          </p>
        </div>
        <Link href="/dashboard/instructors/new">
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Instructor
          </Button>
        </Link>
      </div>

      <Card className="p-4">
        <div className="flex gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search instructors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value)}
            className="border rounded-md px-3 py-2"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <Button variant="outline" onClick={() => void loadInstructors()}>
            Refresh
          </Button>
        </div>

        <div className="grid gap-4">
          {instructors.map((instructor) => (
            <Link
              key={instructor.id}
              href={`/dashboard/instructors/${instructor.id}`}
              className="block"
            >
              <Card className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                      {instructor.profileImageUrl ? (
                        <img
                          src={instructor.profileImageUrl}
                          alt={`${instructor.firstName} ${instructor.lastName}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <InstructorIcon className="w-7 h-7 text-primary" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">
                        {instructor.firstName} {instructor.lastName}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {instructor.email}
                      </p>
                      {instructor.bio && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {instructor.bio}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2 mt-2">
                        {instructor.expertise.slice(0, 4).map((skill) => (
                          <Badge key={skill} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {instructor.expertise.length > 4 && (
                          <Badge variant="secondary" className="text-xs">
                            +{instructor.expertise.length - 4}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right space-y-2">
                    <Badge className={getStatusColor(instructor.isActive)}>
                      {instructor.isActive ? "Active" : "Inactive"}
                    </Badge>
                    <div className="flex items-center justify-end gap-1 text-sm">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="font-medium">{instructor.rating.toFixed(1)}</span>
                      <span className="text-muted-foreground">
                        ({instructor.reviewCount} reviews)
                      </span>
                    </div>
                    <div className="flex items-center justify-end gap-1 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      {instructor.yearsExperience} years exp
                    </div>
                    {instructor.hourlyRate && (
                      <div className="flex items-center justify-end gap-1 text-sm text-muted-foreground">
                        <CurrencyDollar className="w-4 h-4" />
                        ${instructor.hourlyRate}/hr
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {instructors.length === 0 && (
          <div className="text-center py-12">
            <InstructorIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg">No instructors found</h3>
            <p className="text-muted-foreground mt-1">
              Add your first instructor to get started
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
