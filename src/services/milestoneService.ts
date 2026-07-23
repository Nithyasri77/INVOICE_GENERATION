/**
 * Purpose: Data access layer for the Milestones module (project-scoped)
 * Responsibilities: Expose getMilestonesByProject/createMilestone/updateMilestone/deleteMilestone/
 *                    getMilestoneStats as the only way features/milestones reads or writes this
 *                    data
 * NOTE: No Milestones API endpoint exists yet. Each function is wired to call axiosClient (see
 *       the commented real call) but currently operates on an in-memory seed array so the UI is
 *       reviewable end-to-end. Swap the TODO block for the real call once the backend is live.
 * Dependencies: axiosClient, milestone.types
 * Export: getMilestonesByProject, createMilestone, updateMilestone, deleteMilestone,
 *          getMilestoneStats
 */
import type { Milestone, MilestoneFormValues, MilestoneStats } from '../types/milestone.types';

let SEED_MILESTONES: Milestone[] = [
  // Project 1 — ERP Revamp Phase 1 (matches BRD's "Milestone Timeline Example")
  {
    id: '1',
    milestoneCode: 'MS-0001',
    projectId: '1',
    milestoneName: 'Advance',
    description: 'Advance payment on project kickoff',
    amount: 170000,
    dueDate: '2025-02-05',
    status: 'Paid',
    linkedDeliverable: 'Signed MSA + Kickoff Notes',
  },
  {
    id: '2',
    milestoneCode: 'MS-0002',
    projectId: '1',
    milestoneName: 'Development',
    description: 'Core module development completed',
    amount: 340000,
    dueDate: '2025-05-15',
    status: 'Paid',
    linkedDeliverable: 'Staging Build v1',
  },
  {
    id: '3',
    milestoneCode: 'MS-0003',
    projectId: '1',
    milestoneName: 'UAT',
    description: 'User acceptance testing sign-off',
    amount: 170000,
    dueDate: '2025-07-10',
    status: 'In Progress',
    linkedDeliverable: 'UAT Sign-off Document',
  },
  {
    id: '4',
    milestoneCode: 'MS-0004',
    projectId: '1',
    milestoneName: 'Go Live',
    description: 'Production go-live and handover',
    amount: 170000,
    dueDate: '2025-08-15',
    status: 'Not Started',
    linkedDeliverable: 'Go-Live Checklist',
  },
  // Project 2 — Patient Portal Redesign
  {
    id: '5',
    milestoneCode: 'MS-0005',
    projectId: '2',
    milestoneName: 'Advance',
    description: 'Advance payment on project kickoff',
    amount: 108000,
    dueDate: '2025-03-15',
    status: 'Paid',
    linkedDeliverable: 'Signed MSA',
  },
  {
    id: '6',
    milestoneCode: 'MS-0006',
    projectId: '2',
    milestoneName: 'UI Design Sign-off',
    description: 'Figma design approved by client',
    amount: 72000,
    dueDate: '2025-04-20',
    status: 'Invoice Raised',
    linkedDeliverable: 'Figma Design File',
  },
  {
    id: '7',
    milestoneCode: 'MS-0007',
    projectId: '2',
    milestoneName: 'Go Live',
    description: 'Production go-live and handover',
    amount: 180000,
    dueDate: '2025-06-30',
    status: 'Not Started',
    linkedDeliverable: 'Go-Live Checklist',
  },
  // Project 4 — E-commerce Storefront
  {
    id: '8',
    milestoneCode: 'MS-0008',
    projectId: '4',
    milestoneName: 'Advance',
    description: 'Advance payment on project kickoff',
    amount: 196000,
    dueDate: '2025-01-20',
    status: 'Paid',
    linkedDeliverable: 'Signed MSA',
  },
  {
    id: '9',
    milestoneCode: 'MS-0009',
    projectId: '4',
    milestoneName: 'Checkout Module',
    description: 'Payment gateway + checkout flow delivered',
    amount: 294000,
    dueDate: '2025-03-25',
    status: 'Completed',
    linkedDeliverable: 'Checkout Module Build',
  },
  {
    id: '10',
    milestoneCode: 'MS-0010',
    projectId: '4',
    milestoneName: 'Go Live',
    description: 'Production go-live and handover',
    amount: 490000,
    dueDate: '2025-05-30',
    status: 'Completed',
    linkedDeliverable: 'Go-Live Checklist',
  },
];

let nextId = SEED_MILESTONES.length + 1;

function delay<T>(value: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function nextMilestoneCode(): string {
  return `MS-${String(nextId).padStart(4, '0')}`;
}

export async function getMilestonesByProject(projectId: string): Promise<Milestone[]> {
  // TODO: replace with `const { data } = await axiosClient.get<Milestone[]>(`/projects/${projectId}/milestones`); return data;`
  return delay(SEED_MILESTONES.filter((m) => m.projectId === projectId));
}

export async function getMilestoneStats(projectId: string): Promise<MilestoneStats> {
  // TODO: replace with `const { data } = await axiosClient.get<MilestoneStats>(`/projects/${projectId}/milestones/stats`); return data;`
  const rows = SEED_MILESTONES.filter((m) => m.projectId === projectId);
  const today = new Date();

  const completedValue = rows
    .filter((m) => m.status === 'Paid' || m.status === 'Completed')
    .reduce((sum, m) => sum + m.amount, 0);
  const pendingValue = rows
    .filter((m) => m.status !== 'Paid' && m.status !== 'Completed')
    .reduce((sum, m) => sum + m.amount, 0);
  const overdueMilestones = rows.filter(
    (m) => m.status !== 'Paid' && m.status !== 'Completed' && new Date(m.dueDate) < today
  ).length;

  return delay({
    totalMilestones: rows.length,
    completedValue,
    pendingValue,
    overdueMilestones,
  });
}

export async function createMilestone(projectId: string, values: MilestoneFormValues): Promise<Milestone> {
  // TODO: replace with `const { data } = await axiosClient.post<Milestone>(`/projects/${projectId}/milestones`, values); return data;`
  const milestone: Milestone = {
    id: String(nextId),
    milestoneCode: nextMilestoneCode(),
    projectId,
    ...values,
  };
  nextId += 1;
  SEED_MILESTONES = [...SEED_MILESTONES, milestone];
  return delay(milestone);
}

export async function updateMilestone(id: string, values: MilestoneFormValues): Promise<Milestone> {
  // TODO: replace with `const { data } = await axiosClient.put<Milestone>(`/milestones/${id}`, values); return data;`
  SEED_MILESTONES = SEED_MILESTONES.map((m) => (m.id === id ? { ...m, ...values } : m));
  const updated = SEED_MILESTONES.find((m) => m.id === id)!;
  return delay(updated);
}

export async function deleteMilestone(id: string): Promise<void> {
  // TODO: replace with `await axiosClient.delete(`/milestones/${id}`);`
  SEED_MILESTONES = SEED_MILESTONES.filter((m) => m.id !== id);
  return delay(undefined);
}
