/**
 * Purpose: Data access layer for the Projects module
 * Responsibilities: Expose getProjects/getProjectById/createProject/updateProject/deleteProject as
 *                    the only way features/projects reads or writes this data
 * NOTE: No Projects API endpoint exists yet. Each function is wired to call axiosClient (see the
 *       commented real call) but currently operates on an in-memory seed array so the UI is
 *       reviewable end-to-end. Swap the TODO block for the real call once the backend is live.
 * Dependencies: axiosClient, project.types, common.types, clientService (to denormalize clientName)
 * Export: getProjects, getProjectById, createProject, updateProject, deleteProject
 */
import type { Project, ProjectFormValues, ProjectListParams } from '../types/project.types';
import type { PaginatedResponse } from '../types/common.types';
import { getClientById } from './clientService';

let SEED_PROJECTS: Project[] = [
  {
    id: '1',
    projectCode: 'PRJ-0001',
    projectName: 'ERP Revamp — Phase 1',
    clientId: '1',
    clientName: 'Aravind Textiles Pvt Ltd',
    quotationNo: 'QT-2025-011',
    msaNo: 'MSA-2025-004',
    projectValue: 850000,
    startDate: '2025-02-01',
    expectedDelivery: '2025-08-15',
    status: 'Development',
    projectManager: 'Priya Venkatesh',
    receivedTillDate: 425000,
  },
  {
    id: '2',
    projectCode: 'PRJ-0002',
    projectName: 'Patient Portal Redesign',
    clientId: '2',
    clientName: 'Nithya Health Solutions',
    quotationNo: 'QT-2025-018',
    msaNo: 'MSA-2025-007',
    projectValue: 360000,
    startDate: '2025-03-10',
    expectedDelivery: '2025-06-30',
    status: 'UAT',
    projectManager: 'Karthik S',
    receivedTillDate: 180000,
  },
  {
    id: '3',
    projectCode: 'PRJ-0003',
    projectName: 'Fleet Tracking Dashboard',
    clientId: '3',
    clientName: 'Prime Logistics Corp',
    quotationNo: 'QT-2024-092',
    msaNo: 'MSA-2024-019',
    projectValue: 210000,
    startDate: '2024-10-05',
    expectedDelivery: '2025-01-20',
    status: 'On Hold',
    projectManager: 'Priya Venkatesh',
    receivedTillDate: 96000,
  },
  {
    id: '4',
    projectCode: 'PRJ-0004',
    projectName: 'E-commerce Storefront',
    clientId: '4',
    clientName: 'BlueWave Retail',
    quotationNo: 'QT-2025-002',
    msaNo: 'MSA-2025-001',
    projectValue: 980000,
    startDate: '2025-01-15',
    expectedDelivery: '2025-05-30',
    status: 'Live',
    projectManager: 'Ajith Kumar',
    receivedTillDate: 640500,
  },
  {
    id: '5',
    projectCode: 'PRJ-0005',
    projectName: 'Site Billing & Inventory Tool',
    clientId: '5',
    clientName: 'Karthik Constructions',
    quotationNo: 'QT-2025-025',
    msaNo: 'MSA-2025-010',
    projectValue: 420000,
    startDate: '2025-06-01',
    expectedDelivery: '2025-09-15',
    status: 'Development',
    projectManager: 'Karthik S',
    receivedTillDate: 210000,
  },
];

let nextId = SEED_PROJECTS.length + 1;

function delay<T>(value: T, ms = 350): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function nextProjectCode(): string {
  return `PRJ-${String(nextId).padStart(4, '0')}`;
}

export async function getProjects(params: ProjectListParams): Promise<PaginatedResponse<Project>> {
  // TODO: replace with `const { data } = await axiosClient.get<PaginatedResponse<Project>>('/projects', { params }); return data;`
  let rows = [...SEED_PROJECTS];

  if (params.search) {
    const q = params.search.toLowerCase();
    rows = rows.filter(
      (p) =>
        p.projectName.toLowerCase().includes(q) ||
        p.clientName.toLowerCase().includes(q) ||
        p.projectCode.toLowerCase().includes(q) ||
        p.quotationNo.toLowerCase().includes(q) ||
        p.msaNo.toLowerCase().includes(q) ||
        p.projectManager.toLowerCase().includes(q)
    );
  }

  if (params.status) {
    rows = rows.filter((p) => p.status === params.status);
  }

  if (params.clientId) {
    rows = rows.filter((p) => p.clientId === params.clientId);
  }

  if (params.sortBy) {
    const dir = params.sortDirection === 'desc' ? -1 : 1;
    rows.sort((a, b) => {
      const av = (a as unknown as Record<string, unknown>)[params.sortBy!];
      const bv = (b as unknown as Record<string, unknown>)[params.sortBy!];
      if (av == null || bv == null) return 0;
      return av > bv ? dir : av < bv ? -dir : 0;
    });
  }

  const totalEntries = rows.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / params.pageSize));
  const start = (params.page - 1) * params.pageSize;
  const paged = rows.slice(start, start + params.pageSize);

  return delay({
    data: paged,
    page: params.page,
    pageSize: params.pageSize,
    totalEntries,
    totalPages,
  });
}

export async function getProjectById(id: string): Promise<Project | undefined> {
  // TODO: replace with `const { data } = await axiosClient.get<Project>(`/projects/${id}`); return data;`
  return delay(SEED_PROJECTS.find((p) => p.id === id));
}

export async function createProject(values: ProjectFormValues): Promise<Project> {
  // TODO: replace with `const { data } = await axiosClient.post<Project>('/projects', values); return data;`
  const client = await getClientById(values.clientId);
  const project: Project = {
    id: String(nextId),
    projectCode: nextProjectCode(),
    ...values,
    clientName: client?.companyName ?? 'Unknown Client',
    receivedTillDate: 0,
  };
  nextId += 1;
  SEED_PROJECTS = [project, ...SEED_PROJECTS];
  return delay(project);
}

export async function updateProject(id: string, values: ProjectFormValues): Promise<Project> {
  // TODO: replace with `const { data } = await axiosClient.put<Project>(`/projects/${id}`, values); return data;`
  const client = await getClientById(values.clientId);
  SEED_PROJECTS = SEED_PROJECTS.map((p) =>
    p.id === id ? { ...p, ...values, clientName: client?.companyName ?? p.clientName } : p
  );
  const updated = SEED_PROJECTS.find((p) => p.id === id)!;
  return delay(updated);
}

export async function deleteProject(id: string): Promise<void> {
  // TODO: replace with `await axiosClient.delete(`/projects/${id}`);`
  SEED_PROJECTS = SEED_PROJECTS.filter((p) => p.id !== id);
  return delay(undefined);
}
