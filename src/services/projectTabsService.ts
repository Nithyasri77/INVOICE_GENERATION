/**
 * Purpose: Data Access Layer for Project Detail ERP Tabs (Financial Summary, Invoices, Payments, Receipts, Files, Notes)
 * Responsibilities: Provides isolated async functions for each tab with realistic seed data and filtering/sorting/pagination logic
 * Dependencies: projectTabs.types, common.types
 * Export: getProjectFinancialSummary, getProjectInvoices, getProjectInvoiceStats, createProjectInvoice,
 *         getProjectPayments, getProjectPaymentStats, recordProjectPayment,
 *         getProjectReceipts, getProjectReceiptStats,
 *         getProjectFiles, uploadProjectFile, renameProjectFile, deleteProjectFile,
 *         getProjectNotes, createProjectNote, updateProjectNote, deleteProjectNote, togglePinProjectNote
 */
import type { PaginatedResponse, InvoiceStatus } from '../types/common.types';
import type {
  ProjectFinancialSummary,
  ProjectInvoice,
  ProjectInvoiceStats,
  ProjectInvoiceQueryParams,
  CreateProjectInvoiceInput,
  ProjectPayment,
  ProjectPaymentStats,
  ProjectPaymentQueryParams,
  RecordProjectPaymentInput,
  ProjectReceipt,
  ProjectReceiptStats,
  ProjectReceiptQueryParams,
  ProjectFile,
  ProjectFileQueryParams,
  UploadProjectFileInput,
  ProjectNote,
  ProjectNoteQueryParams,
  CreateProjectNoteInput,
  UpdateProjectNoteInput,
} from '../types/projectTabs.types';

function simulateDelay<T>(data: T, ms = 250): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
}

function filterByProject<T extends { projectId: string }>(items: T[], targetProjectId: string): T[] {
  if (!targetProjectId || targetProjectId === 'all') return items;
  const filtered = items.filter((i) => i.projectId === targetProjectId);
  return filtered.length > 0 ? filtered : items;
}

// ==========================================
// 1. FINANCIAL SUMMARY
// ==========================================
export async function getProjectFinancialSummary(projectId: string): Promise<ProjectFinancialSummary> {
  // In real backend: GET /projects/:id/financial-summary
  const totalInvoiced = 850000;
  const totalReceived = 650000;
  const projectValue = 1250000;
  const outstandingAmount = totalInvoiced - totalReceived;

  return simulateDelay({
    projectId,
    projectValue,
    totalInvoiced,
    totalReceived,
    outstandingAmount,
    pendingMilestones: 3,
    upcomingDueDate: '2026-08-15',
    lastPaymentAmount: 250000,
    lastPaymentDate: '2026-07-10',
    invoicedPercentage: Math.round((totalInvoiced / projectValue) * 100),
    receivedPercentage: Math.round((totalReceived / projectValue) * 100),
  });
}

// ==========================================
// 2. INVOICES TAB
// ==========================================
let INVOICES_STORE: ProjectInvoice[] = [
  {
    id: 'inv_001',
    invoiceNo: 'INV-2026-041',
    projectId: 'proj_001',
    invoiceDate: '2026-05-10',
    dueDate: '2026-05-25',
    billingStage: 'Initial Advance',
    billingType: 'Milestone',
    amount: 300000,
    gstAmount: 54000,
    totalAmount: 354000,
    paidAmount: 354000,
    outstandingAmount: 0,
    status: 'Paid',
    notes: 'Advance 30% against agreement signoff',
    createdDate: '2026-05-10',
  },
  {
    id: 'inv_002',
    invoiceNo: 'INV-2026-052',
    projectId: 'proj_001',
    invoiceDate: '2026-06-15',
    dueDate: '2026-06-30',
    billingStage: 'Milestone 1',
    billingType: 'Milestone',
    amount: 250000,
    gstAmount: 45000,
    totalAmount: 295000,
    paidAmount: 295000,
    outstandingAmount: 0,
    status: 'Paid',
    notes: 'UI/UX Prototype Signoff milestone',
    createdDate: '2026-06-15',
  },
  {
    id: 'inv_003',
    invoiceNo: 'INV-2026-068',
    projectId: 'proj_001',
    invoiceDate: '2026-07-01',
    dueDate: '2026-07-15',
    billingStage: 'Milestone 2',
    billingType: 'Milestone',
    amount: 200000,
    gstAmount: 36000,
    totalAmount: 236000,
    paidAmount: 100000,
    outstandingAmount: 136000,
    status: 'Part Paid',
    notes: 'Core API Integration milestone',
    createdDate: '2026-07-01',
  },
  {
    id: 'inv_004',
    invoiceNo: 'INV-2026-079',
    projectId: 'proj_001',
    invoiceDate: '2026-07-10',
    dueDate: '2026-07-24',
    billingStage: 'Ad-hoc',
    billingType: 'Time & Material',
    amount: 100000,
    gstAmount: 18000,
    totalAmount: 118000,
    paidAmount: 0,
    outstandingAmount: 118000,
    status: 'Overdue',
    notes: 'Additional cloud server architecture setup',
    createdDate: '2026-07-10',
  },
  {
    id: 'inv_005',
    invoiceNo: 'INV-2026-088',
    projectId: 'proj_001',
    invoiceDate: '2026-07-25',
    dueDate: '2026-08-10',
    billingStage: 'Final Handover',
    billingType: 'Fixed Price',
    amount: 150000,
    gstAmount: 27000,
    totalAmount: 177000,
    paidAmount: 0,
    outstandingAmount: 177000,
    status: 'Sent',
    notes: 'UAT Signoff invoice',
    createdDate: '2026-07-25',
  },
];

export async function getProjectInvoices(params: ProjectInvoiceQueryParams): Promise<PaginatedResponse<ProjectInvoice>> {
  let list = filterByProject(INVOICES_STORE, params.projectId);

  if (params.search) {
    const q = params.search.toLowerCase();
    list = list.filter(
      (i) => i.invoiceNo.toLowerCase().includes(q) || i.billingStage.toLowerCase().includes(q) || i.notes?.toLowerCase().includes(q)
    );
  }
  if (params.status) {
    list = list.filter((i) => i.status === params.status);
  }
  if (params.billingType) {
    list = list.filter((i) => i.billingType === params.billingType);
  }
  if (params.startDate) {
    list = list.filter((i) => i.invoiceDate >= params.startDate!);
  }
  if (params.endDate) {
    list = list.filter((i) => i.invoiceDate <= params.endDate!);
  }

  if (params.sortBy) {
    const dir = params.sortDirection === 'asc' ? 1 : -1;
    list.sort((a, b) => {
      const aVal = String(a[params.sortBy as keyof ProjectInvoice] ?? '');
      const bVal = String(b[params.sortBy as keyof ProjectInvoice] ?? '');
      return aVal.localeCompare(bVal) * dir;
    });
  } else {
    list.sort((a, b) => b.createdDate.localeCompare(a.createdDate));
  }

  const totalEntries = list.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / params.pageSize));
  const start = (params.page - 1) * params.pageSize;
  const data = list.slice(start, start + params.pageSize);

  return simulateDelay({ data, page: params.page, pageSize: params.pageSize, totalEntries, totalPages });
}

export async function getProjectInvoiceStats(projectId: string): Promise<ProjectInvoiceStats> {
  const invoices = filterByProject(INVOICES_STORE, projectId);
  const totalInvoices = invoices.length;
  const totalInvoicedAmount = invoices.reduce((acc, i) => acc + i.totalAmount, 0);
  const paidAmount = invoices.reduce((acc, i) => acc + i.paidAmount, 0);
  const outstandingAmount = invoices.reduce((acc, i) => acc + i.outstandingAmount, 0);
  const overdueInvoices = invoices.filter((i) => i.status === 'Overdue').length;

  return simulateDelay({ totalInvoices, totalInvoicedAmount, paidAmount, outstandingAmount, overdueInvoices });
}

export async function createProjectInvoice(input: CreateProjectInvoiceInput): Promise<ProjectInvoice> {
  const gstAmount = Math.round((input.amount * input.gstRate) / 100);
  const totalAmount = input.amount + gstAmount;
  const nextNum = INVOICES_STORE.length + 90;

  const newInvoice: ProjectInvoice = {
    id: `inv_${Date.now()}`,
    invoiceNo: `INV-2026-${String(nextNum).padStart(3, '0')}`,
    projectId: input.projectId,
    invoiceDate: input.invoiceDate,
    dueDate: input.dueDate,
    billingStage: input.billingStage,
    billingType: input.billingType,
    amount: input.amount,
    gstAmount,
    totalAmount,
    paidAmount: 0,
    outstandingAmount: totalAmount,
    status: 'Sent',
    notes: input.notes,
    createdDate: new Date().toISOString().slice(0, 10),
  };

  INVOICES_STORE = [newInvoice, ...INVOICES_STORE];
  return simulateDelay(newInvoice);
}

// ==========================================
// 3. PAYMENTS TAB
// ==========================================
let PAYMENTS_STORE: ProjectPayment[] = [
  {
    id: 'pay_001',
    paymentId: 'PAY-2026-089',
    projectId: 'proj_001',
    invoiceNo: 'INV-2026-041',
    paymentDate: '2026-05-12',
    amount: 354000,
    paymentMode: 'Bank Transfer',
    referenceNumber: 'NEFT-UTIB000123984',
    remarks: 'Advance received via NEFT',
    status: 'Reconciled',
    recordedBy: 'Ajith Kumar',
  },
  {
    id: 'pay_002',
    paymentId: 'PAY-2026-094',
    projectId: 'proj_001',
    invoiceNo: 'INV-2026-052',
    paymentDate: '2026-06-20',
    amount: 295000,
    paymentMode: 'UPI',
    referenceNumber: 'UPI/219381923812/HDFC',
    remarks: 'Milestone 1 Payment',
    status: 'Reconciled',
    recordedBy: 'Priya Nair',
  },
  {
    id: 'pay_003',
    paymentId: 'PAY-2026-102',
    projectId: 'proj_001',
    invoiceNo: 'INV-2026-068',
    paymentDate: '2026-07-10',
    amount: 100000,
    paymentMode: 'Bank Transfer',
    referenceNumber: 'RTGS-HDFC20260710-01',
    remarks: 'Partial Payment for Milestone 2',
    status: 'Reconciled',
    recordedBy: 'Ajith Kumar',
  },
];

export async function getProjectPayments(params: ProjectPaymentQueryParams): Promise<PaginatedResponse<ProjectPayment>> {
  let list = filterByProject(PAYMENTS_STORE, params.projectId);

  if (params.search) {
    const q = params.search.toLowerCase();
    list = list.filter(
      (p) =>
        p.paymentId.toLowerCase().includes(q) ||
        p.invoiceNo.toLowerCase().includes(q) ||
        p.referenceNumber.toLowerCase().includes(q) ||
        p.remarks?.toLowerCase().includes(q)
    );
  }
  if (params.paymentMode) {
    list = list.filter((p) => p.paymentMode === params.paymentMode);
  }
  if (params.status) {
    list = list.filter((p) => p.status === params.status);
  }
  if (params.startDate) {
    list = list.filter((p) => p.paymentDate >= params.startDate!);
  }
  if (params.endDate) {
    list = list.filter((p) => p.paymentDate <= params.endDate!);
  }

  if (params.sortBy) {
    const dir = params.sortDirection === 'asc' ? 1 : -1;
    list.sort((a, b) => {
      const aVal = String(a[params.sortBy as keyof ProjectPayment] ?? '');
      const bVal = String(b[params.sortBy as keyof ProjectPayment] ?? '');
      return aVal.localeCompare(bVal) * dir;
    });
  } else {
    list.sort((a, b) => b.paymentDate.localeCompare(a.paymentDate));
  }

  const totalEntries = list.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / params.pageSize));
  const start = (params.page - 1) * params.pageSize;
  const data = list.slice(start, start + params.pageSize);

  return simulateDelay({ data, page: params.page, pageSize: params.pageSize, totalEntries, totalPages });
}

export async function getProjectPaymentStats(projectId: string): Promise<ProjectPaymentStats> {
  const payments = filterByProject(PAYMENTS_STORE, projectId);
  const invoices = filterByProject(INVOICES_STORE, projectId);

  const totalPayments = payments.length;
  const receivedAmount = payments.reduce((acc, p) => acc + p.amount, 0);
  const totalInvoiced = invoices.reduce((acc, i) => acc + i.totalAmount, 0);
  const pendingAmount = Math.max(0, totalInvoiced - receivedAmount);

  const sortedDates = [...payments].sort((a, b) => b.paymentDate.localeCompare(a.paymentDate));
  const lastPaymentDate = sortedDates[0]?.paymentDate ?? 'N/A';

  return simulateDelay({ totalPayments, receivedAmount, pendingAmount, lastPaymentDate });
}

export async function recordProjectPayment(input: RecordProjectPaymentInput): Promise<ProjectPayment> {
  const nextNum = PAYMENTS_STORE.length + 105;
  const newPayment: ProjectPayment = {
    id: `pay_${Date.now()}`,
    paymentId: `PAY-2026-${String(nextNum).padStart(3, '0')}`,
    projectId: input.projectId,
    invoiceNo: input.invoiceNo,
    paymentDate: input.paymentDate,
    amount: input.amount,
    paymentMode: input.paymentMode,
    referenceNumber: input.referenceNumber,
    remarks: input.remarks,
    status: 'Reconciled',
    recordedBy: 'Ajith Kumar',
  };

  PAYMENTS_STORE = [newPayment, ...PAYMENTS_STORE];

  // Also update corresponding invoice paid/outstanding status
  const invIdx = INVOICES_STORE.findIndex((i) => i.invoiceNo === input.invoiceNo);
  if (invIdx !== -1) {
    const inv = INVOICES_STORE[invIdx];
    const newPaid = inv.paidAmount + input.amount;
    const newOutstanding = Math.max(0, inv.totalAmount - newPaid);
    const newStatus: InvoiceStatus = newOutstanding === 0 ? 'Paid' : newPaid > 0 ? 'Part Paid' : inv.status;
    INVOICES_STORE[invIdx] = { ...inv, paidAmount: newPaid, outstandingAmount: newOutstanding, status: newStatus };
  }

  // Generate an automated receipt for this payment
  const receiptNum = RECEIPTS_STORE.length + 45;
  RECEIPTS_STORE = [
    {
      id: `rcp_${Date.now()}`,
      receiptNumber: `RCP-2026-${String(receiptNum).padStart(3, '0')}`,
      projectId: input.projectId,
      invoiceNumber: input.invoiceNo,
      paymentDate: input.paymentDate,
      amount: input.amount,
      paymentMode: input.paymentMode,
      transactionId: input.referenceNumber,
      generatedDate: new Date().toISOString().slice(0, 10),
      clientName: 'ABC Industries Pvt Ltd',
    },
    ...RECEIPTS_STORE,
  ];

  return simulateDelay(newPayment);
}

// ==========================================
// 4. RECEIPTS TAB
// ==========================================
let RECEIPTS_STORE: ProjectReceipt[] = [
  {
    id: 'rcp_001',
    receiptNumber: 'RCP-2026-041',
    projectId: 'proj_001',
    invoiceNumber: 'INV-2026-041',
    paymentDate: '2026-05-12',
    amount: 354000,
    paymentMode: 'Bank Transfer',
    transactionId: 'NEFT-UTIB000123984',
    generatedDate: '2026-05-12',
    clientName: 'ABC Industries Pvt Ltd',
  },
  {
    id: 'rcp_002',
    receiptNumber: 'RCP-2026-042',
    projectId: 'proj_001',
    invoiceNumber: 'INV-2026-052',
    paymentDate: '2026-06-20',
    amount: 295000,
    paymentMode: 'UPI',
    transactionId: 'UPI/219381923812/HDFC',
    generatedDate: '2026-06-20',
    clientName: 'ABC Industries Pvt Ltd',
  },
  {
    id: 'rcp_003',
    receiptNumber: 'RCP-2026-043',
    projectId: 'proj_001',
    invoiceNumber: 'INV-2026-068',
    paymentDate: '2026-07-10',
    amount: 100000,
    paymentMode: 'Bank Transfer',
    transactionId: 'RTGS-HDFC20260710-01',
    generatedDate: '2026-07-10',
    clientName: 'ABC Industries Pvt Ltd',
  },
];

export async function getProjectReceipts(params: ProjectReceiptQueryParams): Promise<PaginatedResponse<ProjectReceipt>> {
  let list = filterByProject(RECEIPTS_STORE, params.projectId);

  if (params.search) {
    const q = params.search.toLowerCase();
    list = list.filter(
      (r) =>
        r.receiptNumber.toLowerCase().includes(q) ||
        r.invoiceNumber.toLowerCase().includes(q) ||
        r.transactionId.toLowerCase().includes(q)
    );
  }
  if (params.paymentMode) {
    list = list.filter((r) => r.paymentMode === params.paymentMode);
  }
  if (params.startDate) {
    list = list.filter((r) => r.paymentDate >= params.startDate!);
  }
  if (params.endDate) {
    list = list.filter((r) => r.paymentDate <= params.endDate!);
  }

  if (params.sortBy) {
    const dir = params.sortDirection === 'asc' ? 1 : -1;
    list.sort((a, b) => {
      const aVal = String(a[params.sortBy as keyof ProjectReceipt] ?? '');
      const bVal = String(b[params.sortBy as keyof ProjectReceipt] ?? '');
      return aVal.localeCompare(bVal) * dir;
    });
  } else {
    list.sort((a, b) => b.generatedDate.localeCompare(a.generatedDate));
  }

  const totalEntries = list.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / params.pageSize));
  const start = (params.page - 1) * params.pageSize;
  const data = list.slice(start, start + params.pageSize);

  return simulateDelay({ data, page: params.page, pageSize: params.pageSize, totalEntries, totalPages });
}

export async function getProjectReceiptStats(projectId: string): Promise<ProjectReceiptStats> {
  const receipts = filterByProject(RECEIPTS_STORE, projectId);
  const invoices = filterByProject(INVOICES_STORE, projectId);

  const todayStr = new Date().toISOString().slice(0, 10);
  const todaysCollection = receipts.filter((r) => r.paymentDate === todayStr).reduce((acc, r) => acc + r.amount, 0);
  const projectCollections = receipts.reduce((acc, r) => acc + r.amount, 0);
  const totalReceipts = receipts.length;
  const totalInvoiced = invoices.reduce((acc, i) => acc + i.totalAmount, 0);
  const outstandingBalance = Math.max(0, totalInvoiced - projectCollections);

  return simulateDelay({ todaysCollection, projectCollections, totalReceipts, outstandingBalance });
}

// ==========================================
// 5. FILES TAB
// ==========================================
let FILES_STORE: ProjectFile[] = [
  {
    id: 'file_001',
    projectId: 'proj_001',
    fileName: 'Project_Proposal_QT-2026-012.pdf',
    category: 'Quotation',
    extension: 'PDF',
    sizeBytes: 2450000,
    uploadedBy: 'Ajith Kumar',
    uploadDate: '2026-04-15',
    url: '#',
  },
  {
    id: 'file_002',
    projectId: 'proj_001',
    fileName: 'Master_Service_Agreement_MSA_009.pdf',
    category: 'Agreement',
    extension: 'PDF',
    sizeBytes: 3800000,
    uploadedBy: 'Priya Nair',
    uploadDate: '2026-04-20',
    url: '#',
  },
  {
    id: 'file_003',
    projectId: 'proj_001',
    fileName: 'Tax_Invoice_INV-2026-041.pdf',
    category: 'Invoice PDFs',
    extension: 'PDF',
    sizeBytes: 850000,
    uploadedBy: 'Ajith Kumar',
    uploadDate: '2026-05-10',
    url: '#',
  },
  {
    id: 'file_004',
    projectId: 'proj_001',
    fileName: 'Payment_Receipt_RCP-2026-041.pdf',
    category: 'Receipts',
    extension: 'PDF',
    sizeBytes: 420000,
    uploadedBy: 'System Auto-Gen',
    uploadDate: '2026-05-12',
    url: '#',
  },
  {
    id: 'file_005',
    projectId: 'proj_001',
    fileName: 'System_Architecture_Diagram_v2.png',
    category: 'Images',
    extension: 'PNG',
    sizeBytes: 5200000,
    uploadedBy: 'Rohan Sharma',
    uploadDate: '2026-06-02',
    url: '#',
  },
  {
    id: 'file_006',
    projectId: 'proj_001',
    fileName: 'UAT_Test_Cases_Specification.xlsx',
    category: 'Project Documents',
    extension: 'XLSX',
    sizeBytes: 1950000,
    uploadedBy: 'Priya Nair',
    uploadDate: '2026-07-05',
    url: '#',
  },
];

export async function getProjectFiles(params: ProjectFileQueryParams): Promise<ProjectFile[]> {
  let list = filterByProject(FILES_STORE, params.projectId);

  if (params.search) {
    const q = params.search.toLowerCase();
    list = list.filter((f) => f.fileName.toLowerCase().includes(q) || f.uploadedBy.toLowerCase().includes(q) || f.category.toLowerCase().includes(q));
  }
  if (params.category && params.category !== 'All') {
    list = list.filter((f) => f.category === params.category);
  }

  if (params.sortBy) {
    const dir = params.sortDirection === 'asc' ? 1 : -1;
    list.sort((a, b) => {
      const aVal = String(a[params.sortBy as keyof ProjectFile] ?? '');
      const bVal = String(b[params.sortBy as keyof ProjectFile] ?? '');
      return aVal.localeCompare(bVal) * dir;
    });
  } else {
    list.sort((a, b) => b.uploadDate.localeCompare(a.uploadDate));
  }

  return simulateDelay(list);
}

export async function uploadProjectFile(input: UploadProjectFileInput): Promise<ProjectFile> {
  const newFile: ProjectFile = {
    id: `file_${Date.now()}`,
    projectId: input.projectId,
    fileName: input.fileName,
    category: input.category,
    extension: input.extension,
    sizeBytes: input.fileSizeBytes,
    uploadedBy: 'Ajith Kumar',
    uploadDate: new Date().toISOString().slice(0, 10),
    url: '#',
  };

  FILES_STORE = [newFile, ...FILES_STORE];
  return simulateDelay(newFile);
}

export async function renameProjectFile(fileId: string, newFileName: string): Promise<ProjectFile> {
  const idx = FILES_STORE.findIndex((f) => f.id === fileId);
  if (idx === -1) throw new Error('File not found');
  FILES_STORE[idx] = { ...FILES_STORE[idx], fileName: newFileName };
  return simulateDelay(FILES_STORE[idx]);
}

export async function moveProjectFileCategory(fileId: string, newCategory: any): Promise<ProjectFile> {
  const idx = FILES_STORE.findIndex((f) => f.id === fileId);
  if (idx === -1) throw new Error('File not found');
  FILES_STORE[idx] = { ...FILES_STORE[idx], category: newCategory };
  return simulateDelay(FILES_STORE[idx]);
}

export async function deleteProjectFile(fileId: string): Promise<void> {
  FILES_STORE = FILES_STORE.filter((f) => f.id !== fileId);
  return simulateDelay(undefined);
}

// ==========================================
// 6. NOTES TAB
// ==========================================
let NOTES_STORE: ProjectNote[] = [
  {
    id: 'note_001',
    projectId: 'proj_001',
    title: 'Client Kickoff Call Summary',
    description:
      'Discussed core milestones with client engineering lead. Agreed to deliver UI prototypes by mid-June and API integrations by July 15th.',
    createdBy: 'Ajith Kumar',
    createdDate: '2026-05-02',
    lastUpdated: '2026-05-02',
    pinned: true,
    tags: ['Kickoff', 'Requirement'],
    attachments: [{ name: 'Kickoff_Minutes.pdf', url: '#' }],
  },
  {
    id: 'note_002',
    projectId: 'proj_001',
    title: 'UAT Server Deployment Credentials',
    description:
      'Staging server deployed on AWS ap-south-1. Access granted to QA team. SSL certificate auto-renew configured.',
    createdBy: 'Priya Nair',
    createdDate: '2026-06-18',
    lastUpdated: '2026-06-18',
    pinned: false,
    tags: ['DevOps', 'UAT'],
  },
  {
    id: 'note_003',
    projectId: 'proj_001',
    title: 'Payment Follow-up Note',
    description:
      'Finance manager confirmed partial payment for Milestone 2 has been processed. Remaining balance scheduled for next Friday.',
    createdBy: 'Ajith Kumar',
    createdDate: '2026-07-11',
    lastUpdated: '2026-07-11',
    pinned: false,
    tags: ['Finance', 'Billing'],
  },
];

export async function getProjectNotes(params: ProjectNoteQueryParams): Promise<ProjectNote[]> {
  let list = filterByProject(NOTES_STORE, params.projectId);

  if (params.search) {
    const q = params.search.toLowerCase();
    list = list.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.description.toLowerCase().includes(q) ||
        n.createdBy.toLowerCase().includes(q) ||
        n.tags.some((t) => t.toLowerCase().includes(q))
    );
  }
  if (params.author) {
    list = list.filter((n) => n.createdBy === params.author);
  }
  if (params.tag) {
    list = list.filter((n) => n.tags.includes(params.tag as string));
  }
  if (params.pinnedOnly) {
    list = list.filter((n) => n.pinned);
  }

  // Sort pinned first, then by date desc
  list.sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return b.lastUpdated.localeCompare(a.lastUpdated);
  });

  return simulateDelay(list);
}

export async function createProjectNote(input: CreateProjectNoteInput): Promise<ProjectNote> {
  const newNote: ProjectNote = {
    id: `note_${Date.now()}`,
    projectId: input.projectId,
    title: input.title,
    description: input.description,
    createdBy: 'Ajith Kumar',
    createdDate: new Date().toISOString().slice(0, 10),
    lastUpdated: new Date().toISOString().slice(0, 10),
    pinned: input.pinned ?? false,
    tags: input.tags ?? ['General'],
  };

  NOTES_STORE = [newNote, ...NOTES_STORE];
  return simulateDelay(newNote);
}

export async function updateProjectNote(noteId: string, input: UpdateProjectNoteInput): Promise<ProjectNote> {
  const idx = NOTES_STORE.findIndex((n) => n.id === noteId);
  if (idx === -1) throw new Error('Note not found');

  NOTES_STORE[idx] = {
    ...NOTES_STORE[idx],
    ...input,
    lastUpdated: new Date().toISOString().slice(0, 10),
  };
  return simulateDelay(NOTES_STORE[idx]);
}

export async function togglePinProjectNote(noteId: string): Promise<ProjectNote> {
  const idx = NOTES_STORE.findIndex((n) => n.id === noteId);
  if (idx === -1) throw new Error('Note not found');
  NOTES_STORE[idx] = { ...NOTES_STORE[idx], pinned: !NOTES_STORE[idx].pinned };
  return simulateDelay(NOTES_STORE[idx]);
}

export async function deleteProjectNote(noteId: string): Promise<void> {
  NOTES_STORE = NOTES_STORE.filter((n) => n.id !== noteId);
  return simulateDelay(undefined);
}
