"use client";

import { Card, Button } from "@vayva/ui";

interface BeforeAfterGalleryProps {
  photos?: any[];
  pendingApproval?: number;
  isLoading?: boolean;
}

export function BeforeAfterGallery({
  photos = [],
  pendingApproval = 0,
  isLoading = false,
}: BeforeAfterGalleryProps) {
  const samplePhotos = [
    {
      id: 1,
      client: "Jessica R.",
      service: "Blonde Balayage",
      stylist: "Michael C.",
      likes: 48,
      comments: 12,
    },
    {
      id: 2,
      client: "Amanda K.",
      service: "Hair Transformation",
      stylist: "Sarah J.",
      likes: 92,
      comments: 24,
    },
  ];

  return (
    <Card className="glass-panel p-6 border border-white/10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Before/After Gallery</h3>
        <Button variant="outline" size="sm" className="glass-button text-xs">
          Upload Photo
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2].map((i) => (
            <div key={i} className="h-32 bg-white/5 rounded-lg"></div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {samplePhotos.map((photo) => (
            <div key={photo.id} className="p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-white font-medium text-sm">{photo.client}</p>
                  <p className="text-gray-500 text-xs">{photo.service}</p>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span>❤️ {photo.likes}</span>
                  <span>💬 {photo.comments}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300 text-xs">
                  View Gallery
                </Button>
                <Button variant="outline" size="sm" className="glass-button text-xs">
                  Approve
                </Button>
              </div>
            </div>
          ))}
          
          <div className="pt-4 border-t border-white/10 text-sm text-gray-500">
            Total Photos: <span className="text-white font-medium">247</span> | Pending Approval:{" "}
            <span className="text-amber-400 font-medium">{pendingApproval || 8}</span>
          </div>
        </div>
      )}
    </Card>
  );
}
