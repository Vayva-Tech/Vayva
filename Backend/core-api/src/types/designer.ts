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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: unknown;
}

export interface Recommendation {
  id: string;
  reason: string;
  expectedImpact: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: unknown;
}
