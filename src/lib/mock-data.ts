import type { User, Case, Hearing, Order, Writ, AuditLog, DashboardStats } from './types';

export const demoUsers: User[] = [
  { id: 'usr_001', name: 'Hon. Victoria Mwangi', email: 'v.mwangi@court.demo', role: 'registrar', department: 'High Court Registry' },
  { id: 'usr_002', name: 'James Kariuki', email: 'j.kariuki@court.demo', role: 'registry', department: 'Civil Registry' },
  { id: 'usr_003', name: 'Hon. Justice Peter Ochieng', email: 'p.ochieng@court.demo', role: 'judge', department: 'Civil Division' },
  { id: 'usr_004', name: 'Sarah Wanjiku', email: 's.wanjiku@court.demo', role: 'associate', department: 'Civil Division' },
  { id: 'usr_005', name: 'Chief Inspector David Mutua', email: 'd.mutua@court.demo', role: 'sheriff', department: 'Enforcement Division' },
  { id: 'usr_006', name: 'Grace Akinyi', email: 'g.akinyi@court.demo', role: 'finance', department: 'Court Finance' },
  { id: 'usr_007', name: 'System Administrator', email: 'admin@court.demo', role: 'admin', department: 'ICT' },
];

export const demoCases: Case[] = [
  {
    id: 'case_001', caseNumber: 'HC/CV/2026/0142', title: 'Sunrise Properties Ltd v. Emerald Holdings Inc.',
    type: 'civil', status: 'active', priority: 'high', filingDate: '2026-01-15', lastActivity: '2026-02-12',
    nextHearing: '2026-02-20', assignedJudge: 'Hon. Justice Peter Ochieng', assignedCourt: 'Civil Court 3', track: 'Commercial Track',
    parties: [
      { id: 'pty_001', name: 'Sunrise Properties Ltd', type: 'plaintiff', email: 'legal@sunrise.demo', counsel: 'Adv. Michael Njoroge' },
      { id: 'pty_002', name: 'Emerald Holdings Inc.', type: 'defendant', email: 'corp@emerald.demo', counsel: 'Adv. Elizabeth Wambui' },
    ],
    events: [
      { id: 'evt_001', caseId: 'case_001', date: '2026-01-15', type: 'filing', title: 'Case Filed', description: 'Initial plaint filed', createdBy: 'James Kariuki' },
      { id: 'evt_002', caseId: 'case_001', date: '2026-01-22', type: 'hearing', title: 'First Mention', description: 'Matter set for directions', createdBy: 'Sarah Wanjiku' },
      { id: 'evt_003', caseId: 'case_001', date: '2026-02-05', type: 'order', title: 'Directions Issued', description: 'Court issued directions', createdBy: 'Hon. Justice Peter Ochieng' },
    ],
    documents: [
      { id: 'doc_001', caseId: 'case_001', name: 'Plaint.pdf', type: 'pleading', uploadedBy: 'James Kariuki', uploadedAt: '2026-01-15T09:30:00Z', version: 1, size: '2.4 MB', restricted: false },
      { id: 'doc_002', caseId: 'case_001', name: 'Supporting Affidavit.pdf', type: 'affidavit', uploadedBy: 'James Kariuki', uploadedAt: '2026-01-15T09:35:00Z', version: 1, size: '1.8 MB', restricted: false },
    ],
    filingFee: 15000, feePaid: true, filingReference: 'RCP-2026-0142-A',
  },
  {
    id: 'case_002', caseNumber: 'HC/CR/2026/0089', title: 'Republic v. John Kamau Maina',
    type: 'criminal', status: 'active', priority: 'urgent', filingDate: '2026-01-08', lastActivity: '2026-02-10',
    nextHearing: '2026-02-18', assignedJudge: 'Hon. Justice Peter Ochieng', assignedCourt: 'Criminal Court 1', track: 'Criminal Track',
    parties: [
      { id: 'pty_003', name: 'Director of Public Prosecutions', type: 'plaintiff', counsel: 'Senior Prosecutor Agnes Mutua' },
      { id: 'pty_004', name: 'John Kamau Maina', type: 'defendant', counsel: 'Adv. Robert Kimani' },
    ],
    events: [{ id: 'evt_004', caseId: 'case_002', date: '2026-01-08', type: 'filing', title: 'Charge Sheet Filed', description: 'Accused charged', createdBy: 'James Kariuki' }],
    documents: [{ id: 'doc_003', caseId: 'case_002', name: 'Charge Sheet.pdf', type: 'pleading', uploadedBy: 'James Kariuki', uploadedAt: '2026-01-08T11:00:00Z', version: 1, size: '890 KB', restricted: true }],
    filingFee: 0, feePaid: true, filingReference: 'RCP-2026-0089-B',
  },
  {
    id: 'case_003', caseNumber: 'HC/CM/2026/0056', title: 'Atlas Trading Co. v. Pacific Merchants Ltd',
    type: 'commercial', status: 'pending', priority: 'medium', filingDate: '2025-12-20', lastActivity: '2026-02-08',
    nextHearing: '2026-02-25', assignedJudge: 'Hon. Justice Peter Ochieng', assignedCourt: 'Commercial Court 2', track: 'Commercial Fast Track',
    parties: [
      { id: 'pty_005', name: 'Atlas Trading Co.', type: 'plaintiff', counsel: 'Adv. Patricia Nyambura' },
      { id: 'pty_006', name: 'Pacific Merchants Ltd', type: 'defendant', counsel: 'Adv. Samuel Otieno' },
    ],
    events: [], documents: [], filingFee: 25000, feePaid: true, filingReference: 'RCP-2025-0056-C',
  },
  {
    id: 'case_004', caseNumber: 'HC/FAM/2026/0023', title: 'In the Matter of Estate of Jane Doe (Deceased)',
    type: 'probate', status: 'active', priority: 'low', filingDate: '2026-01-25', lastActivity: '2026-02-05',
    assignedJudge: 'Hon. Justice Peter Ochieng', assignedCourt: 'Family Court 1', track: 'Probate Track',
    parties: [{ id: 'pty_007', name: 'Mary Doe', type: 'petitioner', counsel: 'Adv. Francis Mwangi' }],
    events: [], documents: [], filingFee: 5000, feePaid: false, filingReference: 'RCP-2026-0023-D',
  },
  {
    id: 'case_005', caseNumber: 'HC/CV/2025/0892', title: 'Green Valley Estates v. Metro Construction Ltd',
    type: 'civil', status: 'closed', priority: 'medium', filingDate: '2025-06-15', lastActivity: '2026-01-30',
    assignedJudge: 'Hon. Justice Peter Ochieng', assignedCourt: 'Civil Court 3', track: 'Civil Track',
    parties: [{ id: 'pty_008', name: 'Green Valley Estates', type: 'plaintiff' }, { id: 'pty_009', name: 'Metro Construction Ltd', type: 'defendant' }],
    events: [{ id: 'evt_005', caseId: 'case_005', date: '2026-01-30', type: 'closure', title: 'Case Closed', description: 'Judgment delivered', createdBy: 'Hon. Justice Peter Ochieng' }],
    documents: [], filingFee: 20000, feePaid: true, filingReference: 'RCP-2025-0892-E',
  },
];

export const demoHearings: Hearing[] = [
  { id: 'hrg_001', caseId: 'case_001', caseNumber: 'HC/CV/2026/0142', caseTitle: 'Sunrise Properties Ltd v. Emerald Holdings Inc.', type: 'directions', status: 'scheduled', date: '2026-02-20', time: '09:00', duration: 30, court: 'Civil Court 3', judge: 'Hon. Justice Peter Ochieng', notes: 'Confirm compliance with directions' },
  { id: 'hrg_002', caseId: 'case_002', caseNumber: 'HC/CR/2026/0089', caseTitle: 'Republic v. John Kamau Maina', type: 'mention', status: 'scheduled', date: '2026-02-18', time: '10:30', duration: 15, court: 'Criminal Court 1', judge: 'Hon. Justice Peter Ochieng' },
  { id: 'hrg_003', caseId: 'case_003', caseNumber: 'HC/CM/2026/0056', caseTitle: 'Atlas Trading Co. v. Pacific Merchants Ltd', type: 'trial', status: 'scheduled', date: '2026-02-25', time: '09:00', duration: 180, court: 'Commercial Court 2', judge: 'Hon. Justice Peter Ochieng', notes: 'Full day trial' },
  { id: 'hrg_004', caseId: 'case_001', caseNumber: 'HC/CV/2026/0142', caseTitle: 'Sunrise Properties Ltd v. Emerald Holdings Inc.', type: 'mention', status: 'completed', date: '2026-01-22', time: '11:00', duration: 20, court: 'Civil Court 3', judge: 'Hon. Justice Peter Ochieng' },
  { id: 'hrg_005', caseId: 'case_004', caseNumber: 'HC/FAM/2026/0023', caseTitle: 'In the Matter of Estate of Jane Doe (Deceased)', type: 'directions', status: 'scheduled', date: '2026-02-28', time: '14:00', duration: 30, court: 'Family Court 1', judge: 'Hon. Justice Peter Ochieng' },
];

export const demoOrders: Order[] = [
  { id: 'ord_001', caseId: 'case_001', caseNumber: 'HC/CV/2026/0142', type: 'direction', status: 'issued', title: 'Directions on Filing of Witness Statements', content: 'IT IS HEREBY ORDERED THAT:\n\n1. The Plaintiff shall file witness statements within 14 days.\n2. The Defendant shall respond within 21 days.\n3. Matter set for mention on 20th February 2026.', issuedBy: 'Hon. Justice Peter Ochieng', issuedDate: '2026-02-05', servedDate: '2026-02-06', createdAt: '2026-02-05T10:00:00Z' },
  { id: 'ord_002', caseId: 'case_005', caseNumber: 'HC/CV/2025/0892', type: 'judgment', status: 'executed', title: 'Final Judgment', content: 'JUDGMENT\n\n1. Judgment in favor of Plaintiff.\n2. Defendant to pay KES 5,000,000 as damages.\n3. Costs to the Plaintiff.', issuedBy: 'Hon. Justice Peter Ochieng', issuedDate: '2026-01-30', servedDate: '2026-01-31', createdAt: '2026-01-30T14:00:00Z', linkedEnforcement: 'wrt_001' },
  { id: 'ord_003', caseId: 'case_002', caseNumber: 'HC/CR/2026/0089', type: 'summons', status: 'served', title: 'Witness Summons', content: 'You are summoned to appear on 18th February 2026 at 10:30 AM.', issuedBy: 'Hon. Justice Peter Ochieng', issuedDate: '2026-02-01', servedDate: '2026-02-05', createdAt: '2026-02-01T09:00:00Z' },
  { id: 'ord_004', caseId: 'case_003', caseNumber: 'HC/CM/2026/0056', type: 'injunction', status: 'pending_review', title: 'Interim Injunction Application', content: 'DRAFT - Application for interim injunction...', createdAt: '2026-02-10T11:00:00Z' },
];

export const demoWrits: Writ[] = [
  {
    id: 'wrt_001', writNumber: 'WE/2026/0012', caseId: 'case_005', caseNumber: 'HC/CV/2025/0892', orderId: 'ord_002',
    type: 'execution', status: 'in_progress', serviceStatus: 'served', issuedDate: '2026-02-01', expiryDate: '2026-05-01',
    assignedOfficer: 'Chief Inspector David Mutua', targetParty: 'Metro Construction Ltd', targetAddress: '456 Industrial Area, Nairobi',
    serviceAttempts: [
      { id: 'svc_001', writId: 'wrt_001', date: '2026-02-03', officer: 'Sgt. Paul Onyango', outcome: 'not_found', notes: 'Premises closed', location: '456 Industrial Area' },
      { id: 'svc_002', writId: 'wrt_001', date: '2026-02-05', officer: 'Sgt. Paul Onyango', outcome: 'served', notes: 'Served on director', location: '456 Industrial Area' },
    ],
    seizureItems: [
      { id: 'szr_001', writId: 'wrt_001', description: 'Toyota Land Cruiser Prado - KDA 123X', estimatedValue: 4500000, condition: 'Good', location: 'Court Compound - Bay 3', status: 'stored', seizedDate: '2026-02-08' },
      { id: 'szr_002', writId: 'wrt_001', description: 'Office Equipment - Computers (5 units)', estimatedValue: 250000, condition: 'Fair', location: 'Court Compound - Store 2', status: 'stored', seizedDate: '2026-02-08' },
    ],
    fees: [
      { id: 'fee_001', writId: 'wrt_001', description: 'Writ Execution Fee', amount: 5000, paid: true, paidDate: '2026-02-01', receiptNumber: 'ENF-2026-0012-A' },
      { id: 'fee_002', writId: 'wrt_001', description: 'Service Fee', amount: 2500, paid: true, paidDate: '2026-02-05', receiptNumber: 'ENF-2026-0012-B' },
      { id: 'fee_003', writId: 'wrt_001', description: 'Seizure and Storage Fee', amount: 15000, paid: false },
    ],
    totalFeesCharged: 22500, totalFeesCollected: 7500,
  },
  {
    id: 'wrt_002', writNumber: 'WA/2026/0008', caseId: 'case_002', caseNumber: 'HC/CR/2026/0089', orderId: 'ord_003',
    type: 'arrest', status: 'pending', serviceStatus: 'pending', issuedDate: '2026-02-10', expiryDate: '2026-03-10',
    assignedOfficer: 'Sgt. Paul Onyango', targetParty: 'Witness: James Weru', targetAddress: '789 Westlands, Nairobi',
    serviceAttempts: [], seizureItems: [],
    fees: [{ id: 'fee_004', writId: 'wrt_002', description: 'Warrant Processing Fee', amount: 1000, paid: true, paidDate: '2026-02-10', receiptNumber: 'ENF-2026-0008-A' }],
    totalFeesCharged: 1000, totalFeesCollected: 1000,
  },
  {
    id: 'wrt_003', writNumber: 'WP/2026/0003', caseId: 'case_001', caseNumber: 'HC/CV/2026/0142', orderId: 'ord_001',
    type: 'possession', status: 'pending', serviceStatus: 'attempted', issuedDate: '2026-02-12', expiryDate: '2026-05-12',
    assignedOfficer: 'Chief Inspector David Mutua', targetParty: 'Emerald Holdings Inc.', targetAddress: '123 Upper Hill, Nairobi',
    serviceAttempts: [{ id: 'svc_003', writId: 'wrt_003', date: '2026-02-14', officer: 'Chief Inspector David Mutua', outcome: 'refused', notes: 'Occupants refused to vacate', location: '123 Upper Hill' }],
    seizureItems: [],
    fees: [{ id: 'fee_005', writId: 'wrt_003', description: 'Possession Writ Fee', amount: 10000, paid: true, paidDate: '2026-02-12', receiptNumber: 'ENF-2026-0003-A' }],
    totalFeesCharged: 10000, totalFeesCollected: 10000,
  },
];

export const demoAuditLogs: AuditLog[] = [
  { id: 'aud_001', timestamp: '2026-02-15T09:00:00Z', userId: 'usr_001', userName: 'Hon. Victoria Mwangi', userRole: 'registrar', action: 'login', module: 'Authentication', entityType: 'session', entityId: 'sess_001', description: 'User logged in', ipAddress: '192.168.1.100' },
  { id: 'aud_002', timestamp: '2026-02-15T09:05:00Z', userId: 'usr_002', userName: 'James Kariuki', userRole: 'registry', action: 'create', module: 'Cases', entityType: 'case', entityId: 'case_001', description: 'Created case: HC/CV/2026/0142', ipAddress: '192.168.1.101' },
  { id: 'aud_003', timestamp: '2026-02-15T09:10:00Z', userId: 'usr_002', userName: 'James Kariuki', userRole: 'registry', action: 'upload', module: 'Documents', entityType: 'document', entityId: 'doc_001', description: 'Uploaded: Plaint.pdf', ipAddress: '192.168.1.101' },
  { id: 'aud_004', timestamp: '2026-02-15T10:00:00Z', userId: 'usr_003', userName: 'Hon. Justice Peter Ochieng', userRole: 'judge', action: 'approve', module: 'Orders', entityType: 'order', entityId: 'ord_001', description: 'Issued directions order', ipAddress: '192.168.1.102' },
  { id: 'aud_005', timestamp: '2026-02-15T10:30:00Z', userId: 'usr_005', userName: 'Chief Inspector David Mutua', userRole: 'sheriff', action: 'update', module: 'Enforcement', entityType: 'writ', entityId: 'wrt_001', description: 'Service status: Served', ipAddress: '192.168.1.103', previousValue: 'attempted', newValue: 'served' },
  { id: 'aud_006', timestamp: '2026-02-15T11:00:00Z', userId: 'usr_005', userName: 'Chief Inspector David Mutua', userRole: 'sheriff', action: 'create', module: 'Enforcement', entityType: 'seizure', entityId: 'szr_001', description: 'Recorded seizure: Toyota Prado', ipAddress: '192.168.1.103' },
  { id: 'aud_007', timestamp: '2026-02-15T11:30:00Z', userId: 'usr_006', userName: 'Grace Akinyi', userRole: 'finance', action: 'view', module: 'Reports', entityType: 'report', entityId: 'rpt_revenue', description: 'Viewed revenue report', ipAddress: '192.168.1.104' },
  { id: 'aud_008', timestamp: '2026-02-15T14:00:00Z', userId: 'usr_001', userName: 'Hon. Victoria Mwangi', userRole: 'registrar', action: 'assign', module: 'Cases', entityType: 'case', entityId: 'case_003', description: 'Assigned case to judge', ipAddress: '192.168.1.100' },
];

export const dashboardStats: DashboardStats = {
  totalActiveCases: 156, casesFiledThisMonth: 24, pendingHearings: 43, pendingEnforcement: 18,
  enforcementCompletionRate: 76.5, averageCaseAge: 127, revenueThisMonth: 2450000, revenueLastMonth: 2180000,
  casesByAge: [
    { label: '0-30 days', count: 28, color: '#22c55e' },
    { label: '31-90 days', count: 45, color: '#84cc16' },
    { label: '91-180 days', count: 38, color: '#eab308' },
    { label: '181-365 days', count: 29, color: '#f97316' },
    { label: '> 1 year', count: 16, color: '#ef4444' },
  ],
  casesByType: [
    { type: 'civil', count: 67 }, { type: 'criminal', count: 42 }, { type: 'commercial', count: 28 },
    { type: 'family', count: 12 }, { type: 'probate', count: 7 },
  ],
  monthlyTrend: [
    { month: 'Sep', filed: 18, closed: 12 }, { month: 'Oct', filed: 22, closed: 15 },
    { month: 'Nov', filed: 19, closed: 21 }, { month: 'Dec', filed: 15, closed: 18 },
    { month: 'Jan', filed: 26, closed: 14 }, { month: 'Feb', filed: 24, closed: 16 },
  ],
  topBottlenecks: [
    { stage: 'Service of Process', count: 23, avgDays: 18 },
    { stage: 'Awaiting Directions', count: 19, avgDays: 35 },
    { stage: 'Witness Statements', count: 15, avgDays: 28 },
    { stage: 'Enforcement Pending', count: 12, avgDays: 45 },
    { stage: 'Judgment Writing', count: 8, avgDays: 42 },
  ],
};
