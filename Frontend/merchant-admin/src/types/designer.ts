export interface DesignerTemplate {
  id: string;
  name: string;
  status: string;
  category: string;
  revenue: number;
  downloads: number;
  currentVersion: string;
  previewImageDesktop?: string;
  previewImages?: { cover?: string };
  aiReviewResult?: { status: string; issues: string[] };
    [key: string]: any;
}

export interface Recommendation {
  id: string;
  reason: string;
  expectedImpact: string;
    [key: string]: any;
}
