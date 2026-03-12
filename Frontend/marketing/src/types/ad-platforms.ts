export type AdPlatform = 'google' | 'facebook' | 'instagram' | 'tiktok';

export interface AdCampaign {
  id: string;
  platform: AdPlatform;
  name: string;
  budget: number;
  status: 'active' | 'paused' | 'ended';
}