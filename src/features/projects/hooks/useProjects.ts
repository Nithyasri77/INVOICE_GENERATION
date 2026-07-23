/**
 * Purpose: Data-fetching/mutation hooks for the Projects module
 * Responsibilities: Wrap projectService calls in useQuery/useMutation (caching, loading/error
 *                    states, cache invalidation on write); also exposes useClientOptions for the
 *                    Client picker in ProjectFormModal
 * Dependencies: @tanstack/react-query, projectService, clientService, project.types
 * Export: useProjects, useProject, useCreateProject, useUpdateProject, useDeleteProject,
 *          useClientOptions
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
} from '../../../services/projectService';
import { getAllClients } from '../../../services/clientService';
import type { ProjectFormValues, ProjectListParams } from '../../../types/project.types';

const PROJECTS_KEY = 'projects';

export function useProjects(params: ProjectListParams) {
  return useQuery({
    queryKey: [PROJECTS_KEY, params],
    queryFn: () => getProjects(params),
    placeholderData: (prev) => prev,
  });
}

export function useProject(id: string | undefined) {
  return useQuery({
    queryKey: [PROJECTS_KEY, 'detail', id],
    queryFn: () => getProjectById(id as string),
    enabled: !!id,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: ProjectFormValues) => createProject(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROJECTS_KEY] });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: ProjectFormValues }) => updateProject(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROJECTS_KEY] });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROJECTS_KEY] });
    },
  });
}

/** Client dropdown options for the project create/edit form */
export function useClientOptions() {
  return useQuery({
    queryKey: ['clients', 'options'],
    queryFn: getAllClients,
    select: (clients) => clients.map((c) => ({ value: c.id, label: c.companyName })),
  });
}
