// src/hooks/useClaims.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { StudentClaim, ClaimResponse, ApiResponse, FilterOptions } from '../lib/types';
import useUserAxios from './useUserAxios';
const ENDPOINTS = {
  claims: '/api/claims/claims/',
  responses: '/api/claims/responses/',
  addResponse: (id: number) => `/api/claims/claims/${id}/add_response/`,
};

export const useClaims = (filters?: FilterOptions) => {
    const axios= useUserAxios()
  return useQuery({
    queryKey: ['claims', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.search) params.append('search', filters.search);
      if (filters?.page) params.append('page', filters.page.toString());
      
      const response = await axios.get<ApiResponse<StudentClaim[]>>(ENDPOINTS.claims, { params });
      return response.data.data;
    },
  });
};

export const useClaim = (id: number) => {
    const axios= useUserAxios()
  return useQuery({
    queryKey: ['claim', id],
    queryFn: async () => {
      const response = await axios.get<ApiResponse<StudentClaim>>(`${ENDPOINTS.claims}${id}/`);
      return response.data.data;
    },
    enabled: !!id,
  });
};

export const useCreateClaim = () => {
  const queryClient = useQueryClient();
  const axios= useUserAxios()
  
  return useMutation({
    mutationFn: async (claim: Partial<StudentClaim>) => {
      const response = await axios.post<ApiResponse<StudentClaim>>(ENDPOINTS.claims, claim);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['claims'] });
    },
  });
};

export const useUpdateClaim = () => {
  const queryClient = useQueryClient();
  const axios= useUserAxios()
  
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<StudentClaim> & { id: number }) => {
      const response = await axios.patch<ApiResponse<StudentClaim>>(`${ENDPOINTS.claims}${id}/`, data);
      return response.data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['claims'] });
      queryClient.invalidateQueries({ queryKey: ['claim', data.id] });
    },
  });
};

export const useAddResponse = () => {
  const queryClient = useQueryClient();
  const axios= useUserAxios()
  
  return useMutation({
    mutationFn: async ({ claimId, message, is_internal }: { claimId: number; message: string; is_internal?: boolean }) => {
      const response = await axios.post<ApiResponse<ClaimResponse>>(
        ENDPOINTS.addResponse(claimId),
        { message, is_internal }
      );
      return response.data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['claim', data.claim] });
    },
  });
};

export const useClaimResponses = (claimId?: number) => {
    const axios= useUserAxios()
  return useQuery({
    queryKey: ['responses', claimId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (claimId) params.append('claim', claimId.toString());
      
      const response = await axios.get<ApiResponse<ClaimResponse[]>>(ENDPOINTS.responses, { params });
      return response.data.data;
    },
    enabled: !!claimId,
  });
};