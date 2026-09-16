import { apiClient } from './client';
import { MarketingCampaign, SocialPost } from '../types';
import { MOCK_CAMPAIGNS, MOCK_SOCIAL_POSTS } from './mockData';

let socialPostsState: SocialPost[] = [...MOCK_SOCIAL_POSTS];

export const marketingApi = {
  getCampaigns: async (): Promise<MarketingCampaign[]> => {
    try {
      const response = await apiClient.get<MarketingCampaign[]>('/marketing/campaigns/');
      return response.data;
    } catch {
      return MOCK_CAMPAIGNS;
    }
  },

  getSocialPosts: async (): Promise<SocialPost[]> => {
    try {
      const response = await apiClient.get<SocialPost[]>('/marketing/social-posts/');
      return response.data;
    } catch {
      return socialPostsState;
    }
  },

  createSocialPost: async (payload: Partial<SocialPost>): Promise<SocialPost> => {
    try {
      const response = await apiClient.post<SocialPost>('/marketing/social-posts/', payload);
      return response.data;
    } catch {
      const newPost: SocialPost = {
        id: `soc_${Date.now()}`,
        channel: payload.channel || 'LinkedIn',
        campaignName: payload.campaignName || 'OmniCore Campaign',
        caption: payload.caption || '',
        imageUrl: payload.imageUrl,
        scheduledTime: payload.scheduledTime || new Date().toISOString().slice(0, 16).replace('T', ' '),
        reach: 0,
        engagements: 0,
        leadsGenerated: 0,
        conversions: 0,
        spend: payload.spend || 0,
        status: payload.status || 'draft',
      };
      socialPostsState = [newPost, ...socialPostsState];
      return newPost;
    }
  },

  updateSocialPostStatus: async (
    id: string,
    status: SocialPost['status']
  ): Promise<SocialPost> => {
    try {
      const response = await apiClient.patch<SocialPost>(`/marketing/social-posts/${id}/`, { status });
      return response.data;
    } catch {
      const index = socialPostsState.findIndex((p) => p.id === id);
      if (index === -1) throw new Error('Social post not found');
      const updated: SocialPost = { ...socialPostsState[index], status };
      socialPostsState[index] = updated;
      return updated;
    }
  },
};

