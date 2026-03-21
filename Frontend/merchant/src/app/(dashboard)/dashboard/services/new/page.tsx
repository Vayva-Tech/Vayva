"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { logger } from "@vayva/shared";
import { Button, Input } from "@vayva/ui";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Spinner as Loader2, Clock } from "@phosphor-icons/react/ssr";
import { BackButton } from "@/components/ui/BackButton";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { ServiceProductMetadata } from "@/lib/types/service";

type ServiceFormData = {
  name: string;
  description: string;
  price: string;
};

import { apiJson } from "@/lib/api-client-shared";

interface CreateServiceResponse {
  success: boolean;
  id: string;
}

export default function NewServicePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ServiceFormData>({
    name: "",
    description: "",
    price: "",
  });
  const [metadata, setMetadata] = useState<ServiceProductMetadata>({
    durationMinutes: 60,
    bufferTimeMinutes: 0,
    location: "IN_STORE",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    try {
      const price = Number(formData.price);
      if (!Number.isFinite(price) || price < 0) {
        toast.error("Enter a valid price");
        return;
      }

      await apiJson<CreateServiceResponse>("/api/services", {
        method: "POST",
        body: JSON.stringify({
          ...formData,
          price,
          metadata,
        }),
      });

      toast.success("Service created!");
      router.push("/dashboard/services");
    } catch (err: unknown) {
      const _errMsg = err instanceof Error ? err.message : String(err);
      logger.error("[CREATE_SERVICE_ERROR]", {
        error: _errMsg,
        app: "merchant",
      });
      toast.error("Failed to create service");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-10">
      <Breadcrumbs />
      <BackButton
        href="/dashboard/services"
        label="Back to Services"
        className="mb-4"
      />

      <div className="space-y-1">
        <h2 className="text-3xl font-bold tracking-tight">Add Service</h2>
        <p className="text-gray-500">
          Define a service that customers can book.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Service Details</CardTitle>
            <CardDescription>Name, price, and description.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Service Name</Label>
              <Input
                id="name"
                required
                value={formData.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData({ ...formData, name: e.target?.value })
                }
                placeholder="e.g. Premium Haircut"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="price">Price (NGN)</Label>
              <Input
                id="price"
                type="number"
                required
                value={formData.price}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData({ ...formData, price: e.target?.value })
                }
                placeholder="0.00"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setFormData({ ...formData, description: e.target?.value })
                }
                placeholder="Describe the service..."
              />
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Scheduling</CardTitle>
            <CardDescription>Duration and location settings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="duration">Duration (Minutes)</Label>
                <div className="relative">
                  <Clock className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    id="duration"
                    type="number"
                    className="pl-9"
                    value={metadata.durationMinutes}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setMetadata({
                        ...metadata,
                        durationMinutes:
                          Number.parseInt(e.target?.value, 10) || 0,
                      })
                    }
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="buffer">Buffer Time (Minutes)</Label>
                <Input
                  id="buffer"
                  type="number"
                  value={metadata.bufferTimeMinutes ?? 0}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setMetadata({
                      ...metadata,
                      bufferTimeMinutes:
                        Number.parseInt(e.target?.value, 10) || 0,
                    })
                  }
                  placeholder="Gap between appts"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Location</Label>
              <Select
                value={metadata.location}
                onValueChange={(val: string) => {
                  const allowed: ServiceProductMetadata["location"][] = [
                    "IN_STORE",
                    "HOME_SERVICE",
                    "VIRTUAL",
                    "ONLINE",
                    "ON_SITE",
                    "CLIENT_LOCATION",
                  ];

                  if (
                    allowed.includes(val as ServiceProductMetadata["location"])
                  ) {
                    setMetadata({
                      ...metadata,
                      location: val as ServiceProductMetadata["location"],
                    });
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IN_STORE">In Store / Clinic</SelectItem>
                  <SelectItem value="HOME_SERVICE">Home Service</SelectItem>
                  <SelectItem value="VIRTUAL">Virtual / Online</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Service
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
