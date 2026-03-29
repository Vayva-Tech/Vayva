/**
 * Travel - Reviews Management Page
 * Manage customer reviews, ratings, and feedback
 */

"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Star, ThumbsUp, MessageSquare, Filter } from "lucide-react";
import { useState } from "react";

interface Review {
  id: string;
  customerName: string;
  type: "destination" | "hotel" | "flight" | "package";
  itemName: string;
  rating: number;
  title: string;
  comment: string;
  date: string;
  status: "pending" | "approved" | "rejected";
  helpful: number;
}

export default function TravelReviewsPage() {
  const router = useRouter();
  const [filter, setFilter] = useState("all");

  const reviews: Review[] = [
    { id: "1", customerName: "John Smith", type: "hotel", itemName: "Grand Plaza Hotel", rating: 5, title: "Amazing Experience!", comment: "The service was exceptional and the rooms were luxurious. Highly recommend!", date: "2024-01-15", status: "approved", helpful: 24 },
    { id: "2", customerName: "Emily Chen", type: "destination", itemName: "Bali, Indonesia", rating: 5, title: "Paradise on Earth", comment: "Beautiful beaches, amazing culture, and friendly people. Will definitely return!", date: "2024-01-14", status: "approved", helpful: 18 },
    { id: "3", customerName: "Mike Wilson", type: "flight", itemName: "AA123 - JFK to CDG", rating: 4, title: "Good Flight", comment: "Comfortable seats and good service. Food could be better.", date: "2024-01-13", status: "pending", helpful: 5 },
    { id: "4", customerName: "Sarah Johnson", type: "package", itemName: "European Tour Package", rating: 5, title: "Dream Vacation", comment: "Everything was perfectly organized. Best vacation ever!", date: "2024-01-12", status: "approved", helpful: 31 },
  ];

  const filteredReviews = filter === "all" ? reviews : filter === "pending" ? reviews.filter(r => r.status === "pending") : reviews.filter(r => r.rating <= 3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/travel")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Reviews & Feedback</h1>
            <p className="text-muted-foreground">Manage customer reviews and ratings</p>
          </div>
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Export Reviews
        </Button>
      </div>

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
                <p className="text-sm text-muted-foreground">Avg Rating</p>
                <p className="text-2xl font-bold">4.7</p>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{reviews.filter(r => r.status === "pending").length}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Negative</p>
                <p className="text-2xl font-bold">{reviews.filter(r => r.rating <= 3).length}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        <Button 
          variant={filter === "all" ? "default" : "outline"} 
          size="sm"
          onClick={() => setFilter("all")}
        >
          All Reviews
        </Button>
        <Button 
          variant={filter === "pending" ? "default" : "outline"} 
          size="sm"
          onClick={() => setFilter("pending")}
        >
          Pending ({reviews.filter(r => r.status === "pending").length})
        </Button>
        <Button 
          variant={filter === "negative" ? "default" : "outline"} 
          size="sm"
          onClick={() => setFilter("negative")}
        >
          Needs Attention ({reviews.filter(r => r.rating <= 3).length})
        </Button>
      </div>

      {/* Reviews Grid */}
      <div className="grid gap-4">
        {filteredReviews.map((review) => (
          <Card key={review.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-4 w-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                        />
                      ))}
                    </div>
                    <Badge variant={review.status === "approved" ? "default" : review.status === "pending" ? "secondary" : "destructive"}>
                      {review.status}
                    </Badge>
                  </div>
                  <h3 className="text-lg font-semibold">{review.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {review.customerName} • {review.type} • {review.itemName}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">{review.date}</p>
                </div>
              </div>

              <p className="text-muted-foreground mb-4">{review.comment}</p>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <thumbsUp className="h-4 w-4" / scope="col">
                  <span>{review.helpful} found this helpful</span>
                </div>
                <div className="flex gap-2">
                  {review.status === "pending" && (
                    <>
                      <Button size="sm" variant="outline">Reject</Button>
                      <Button size="sm">Approve</Button>
                    </>
                  )}
                  <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/travel/reviews/${review.id}`)}>
                    View Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
