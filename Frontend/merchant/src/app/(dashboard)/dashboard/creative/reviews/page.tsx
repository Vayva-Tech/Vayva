/**
 * Creative Industry - Client Reviews & Testimonials Page
 * Manage client feedback, testimonials, and ratings
 */

"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Star, Search, Plus, MessageSquare, ThumbsUp } from "lucide-react";
import { useState } from "react";

interface Review {
  id: string;
  clientName: string;
  company: string;
  project: string;
  rating: number;
  title: string;
  comment: string;
  date: string;
  status: "approved" | "pending" | "rejected";
  featured: boolean;
}

export default function CreativeReviewsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  const reviews: Review[] = [
    { id: "1", clientName: "John Smith", company: "Tech Corp", project: "Brand Identity Redesign", rating: 5, title: "Exceptional branding work!", comment: "The team delivered an outstanding brand identity that perfectly captures our vision. Professional, creative, and responsive throughout.", date: "2024-01-20", status: "approved", featured: true },
    { id: "2", clientName: "Sarah Johnson", company: "Fashion Boutique", project: "E-commerce Website", rating: 5, title: "Amazing website design", comment: "Our new Shopify store has exceeded all expectations. Sales are up 40% since launch!", date: "2024-01-18", status: "approved", featured: true },
    { id: "3", clientName: "Mike Chen", company: "StartupXYZ", project: "Product Launch Campaign", rating: 4, title: "Great marketing campaign", comment: "Very professional team with excellent creative ideas. Would definitely work with them again.", date: "2024-01-15", status: "approved", featured: false },
    { id: "4", clientName: "Emily Davis", company: "Law Firm", project: "Corporate Video", rating: 5, title: "High-quality video production", comment: "The corporate video they produced was cinematic quality. Impressed our stakeholders significantly.", date: "2024-01-10", status: "pending", featured: false },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/creative")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Client Reviews</h1>
            <p className="text-muted-foreground">Manage testimonials and client feedback</p>
          </div>
        </div>
        <Button onClick={() => router.push("/dashboard/creative/reviews/new")}>
          <Plus className="h-4 w-4 mr-2" />
          Add Testimonial
        </Button>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by client, company, or project..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Reviews</p>
                <p className="text-2xl font-bold">{reviews.length}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Average Rating</p>
                <p className="text-2xl font-bold">{(reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)}</p>
              </div>
              <Star className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Featured</p>
                <p className="text-2xl font-bold">{reviews.filter(r => r.featured).length}</p>
              </div>
              <thumbsUp className="h-8 w-8 text-green-600" / scope="col">
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Approval</p>
                <p className="text-2xl font-bold">{reviews.filter(r => r.status === "pending").length}</p>
              </div>
              <Star className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b" scope="col">
                <tr className="text-left text-sm text-muted-foreground">
                  <th className="py-3 px-4 font-medium" scope="col">Client</th>
                  <th className="py-3 px-4 font-medium" scope="col">Company</th>
                  <th className="py-3 px-4 font-medium" scope="col">Project</th>
                  <th className="py-3 px-4 font-medium" scope="col">Rating</th>
                  <th className="py-3 px-4 font-medium" scope="col">Review Title</th>
                  <th className="py-3 px-4 font-medium" scope="col">Comment</th>
                  <th className="py-3 px-4 font-medium" scope="col">Date</th>
                  <th className="py-3 px-4 font-medium" scope="col">Status</th>
                  <th className="py-3 px-4 font-medium" scope="col"></th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((review) => (
                  <tr key={review.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4 font-semibold">{review.clientName}</td>
                    <td className="py-3 px-4">{review.company}</td>
                    <td className="py-3 px-4 text-sm">{review.project}</td>
                    <td className="py-3 px-4">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-3 w-3 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                          />
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium">{review.title}</td>
                    <td className="py-3 px-4 text-sm truncate max-w-[250px]">{review.comment}</td>
                    <td className="py-3 px-4 text-sm">{review.date}</td>
                    <td className="py-3 px-4">
                      <Badge variant={review.status === "approved" ? "default" : review.status === "pending" ? "secondary" : "outline"}>
                        {review.status}
                      </Badge>
                      {review.featured && <Badge variant="outline" className="ml-1">⭐ Featured</Badge>}
                    </td>
                    <td className="py-3 px-4">
                      <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/creative/reviews/${review.id}`)}>
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
