"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button, Card, Input, Badge } from "@vayva/ui";
import {
  Plus,
  Package,
  MagnifyingGlass as Search,
  ArrowSquareOut,
} from "@phosphor-icons/react/ssr";
import { toast } from "sonner";

interface Resource {
  id: string;
  name: string;
  title: string;
  price: number;
  image: string | null;
  status: string;
}

const RESOURCE_TYPES = [
  { value: "service", label: "Services", icon: "Wrench" },
  { value: "campaign", label: "Campaigns", icon: "Megaphone" },
  { value: "listing", label: "Listings", icon: "Building" },
  { value: "course", label: "Courses", icon: "GraduationCap" },
  { value: "post", label: "Posts", icon: "FileText" },
  { value: "stay", label: "Stays", icon: "Bed" },
  { value: "event", label: "Events", icon: "Calendar" },
  { value: "digital_asset", label: "Digital Assets", icon: "Download" },
  { value: "menu_item", label: "Menu Items", icon: "ForkKnife" },
  { value: "project", label: "Projects", icon: "Folder" },
  { value: "vehicle", label: "Vehicles", icon: "Car" },
  { value: "lead", label: "Leads", icon: "Users" },
];

export default function ResourcesPage() {
  const [selectedType, setSelectedType] = useState("service");
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchResources = async (type: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/resources/list?type=${type}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setResources(data || []);
    } catch {
      toast.error("Failed to load resources");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources(selectedType);
  }, [selectedType]);

  const filteredResources = resources.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Resources</h1>
          <p className="text-gray-700 text-sm mt-1">
            Manage all your business resources in one place
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/resources/new">
            <Plus className="h-4 w-4 mr-2" />
            New Resource
          </Link>
        </Button>
      </div>

      {/* Type Selector */}
      <div className="flex flex-wrap gap-2">
        {RESOURCE_TYPES.map((type) => (
          <Button
            type="button"
            variant="ghost"
            key={type.value}
            onClick={() => setSelectedType(type.value)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              selectedType === type.value
                ? "bg-green-500 text-white"
                : "bg-white hover:bg-white text-gray-700"
            }`}
          >
            {type.label}
          </Button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        <Input
          placeholder={`Search ${RESOURCE_TYPES.find((t) => t.value === selectedType)?.label.toLowerCase() || "resources"}...`}
          value={searchQuery}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Resources Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="h-40 animate-pulse bg-gray-50"><div /></Card>
          ))}
        </div>
      ) : filteredResources.length === 0 ? (
        <Card className="p-12 text-center">
          <Package className="h-12 w-12 mx-auto text-gray-500 mb-4" />
          <h3 className="font-medium text-lg">No resources found</h3>
          <p className="text-gray-700 mt-2 mb-4">
            {searchQuery
              ? "No matches for your search"
              : `No ${RESOURCE_TYPES.find((t) => t.value === selectedType)?.label.toLowerCase()} yet`}
          </p>
          <Button asChild>
            <Link href="/dashboard/resources/new">
              <Plus className="h-4 w-4 mr-2" />
              Create Resource
            </Link>
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredResources.map((resource) => (
            <Card key={resource.id} className="overflow-hidden group">
              <div className="aspect-video bg-gray-50 relative">
                {resource.image ? (
                  <img
                    src={resource.image}
                    alt={resource.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="h-8 w-8 text-gray-500" />
                  </div>
                )}
                <Badge
                  className="absolute top-2 right-2"
                  variant={
                    resource.status?.toUpperCase() === "ACTIVE"
                      ? "success"
                      : "default"
                  }
                >
                  {resource.status}
                </Badge>
              </div>

              <div className="p-4">
                <h3 className="font-medium truncate">{resource.name}</h3>
                <p className="text-lg font-semibold mt-1">
                  ${resource.price.toFixed(2)}
                </p>
                <div className="flex items-center justify-between mt-3">
                  <Link
                    href={`/dashboard/resources/${resource.id}`}
                    className="text-green-600 hover:underline text-sm"
                  >
                    Edit
                  </Link>
                  <Link
                    href={`/r/${resource.id}`}
                    target="_blank"
                    className="text-gray-700 hover:text-green-600 text-sm flex items-center gap-1"
                  >
                    <ArrowSquareOut className="h-3 w-3" />
                    View
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
