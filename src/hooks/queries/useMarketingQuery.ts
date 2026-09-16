import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './queryKeys';
import { marketingApi } from '../../api/marketing.api';
import { SocialPost } from '../../types';

// ==================== QUERIES ====================

export function useMarketingCampaigns() {
  return useQuery({
    queryKey: queryKeys.marketing.campaigns,
    queryFn: () => marketingApi.getCampaigns(),
  });
}

export function useSocialPosts() {
  return useQuery({
    queryKey: queryKeys.marketing.socialPosts,
    queryFn: () => marketingApi.getSocialPosts(),
  });
}

// ==================== MUTATIONS ====================

export function useCreateSocialPostMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Partial<SocialPost>) => marketingApi.createSocialPost(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.marketing.socialPosts });
      queryClient.invalidateQueries({ queryKey: queryKeys.marketing.campaigns });
    },
  });
}
