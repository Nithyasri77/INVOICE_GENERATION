/**
 * Purpose: Data-fetching/mutation hooks for the Milestones module (project-scoped)
 * Responsibilities: Wrap milestoneService calls in useQuery/useMutation (caching, loading/error
 *                    states, cache invalidation on write) — this is the only thing the
 *                    Project Detail page's Milestones tab imports from the data layer
 * Dependencies: @tanstack/react-query, milestoneService, milestone.types
 * Export: useMilestones, useMilestoneStats, useCreateMilestone, useUpdateMilestone,
 *          useDeleteMilestone
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getMilestonesByProject,
  getMilestoneStats,
  createMilestone,
  updateMilestone,
  deleteMilestone,
} from '../../../services/milestoneService';
import type { MilestoneFormValues } from '../../../types/milestone.types';

const MILESTONES_KEY = 'milestones';

export function useMilestones(projectId: string | undefined) {
  return useQuery({
    queryKey: [MILESTONES_KEY, projectId],
    queryFn: () => getMilestonesByProject(projectId as string),
    enabled: !!projectId,
  });
}

export function useMilestoneStats(projectId: string | undefined) {
  return useQuery({
    queryKey: [MILESTONES_KEY, 'stats', projectId],
    queryFn: () => getMilestoneStats(projectId as string),
    enabled: !!projectId,
  });
}

function invalidateMilestones(queryClient: ReturnType<typeof useQueryClient>, projectId: string) {
  queryClient.invalidateQueries({ queryKey: [MILESTONES_KEY, projectId] });
  queryClient.invalidateQueries({ queryKey: [MILESTONES_KEY, 'stats', projectId] });
}

export function useCreateMilestone(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: MilestoneFormValues) => createMilestone(projectId, values),
    onSuccess: () => invalidateMilestones(queryClient, projectId),
  });
}

export function useUpdateMilestone(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: MilestoneFormValues }) => updateMilestone(id, values),
    onSuccess: () => invalidateMilestones(queryClient, projectId),
  });
}

export function useDeleteMilestone(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteMilestone(id),
    onSuccess: () => invalidateMilestones(queryClient, projectId),
  });
}
