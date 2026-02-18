// User & Role Types
export type UserRole =
  | 'registrar'
  | 'registry'
  | 'judge'
  | 'associate'
  | 'sheriff'
  | 'finance'
  | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  department?: string;
}

// Case Types
export type CaseType = 'civil' | 'criminal' | 'commercial' | 'family' | 'probate';
export type CaseStatus = 'filed' | 'active' | 'pending' | 'closed' | 'archived';
export type CasePriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Party {
  id: string;
  name: string;
  type: 'plaintiff' | 'defendant' | 'petitioner' | 'respondent' | 'witness';
  email?: string;
  phone?: string;
  address?: string;
  counsel?: string;
  counselEmail?: string;
}

export interface CaseEvent {
  id: string;
  caseId: string;
  date: string;
  type: 'filing' | 'hearing' | 'order' | 'motion' | 'service' | 'enforcement' | 'closure' | 'other';
  title: string;
  description: string;
  createdBy: string;
}

export interface CaseDocument {
  id: string;
  caseId: string;
  name: string;
  type: 'pleading' | 'affidavit' | 'order' | 'evidence' | 'motion' | 'writ' | 'receipt' | 'other';
  uploadedBy: string;
  uploadedAt: string;
  version: number;
  size: string;
  checksum?: string;
  restricted: boolean;
}

export interface Case {
  id: string;
  caseNumber: string;
  title: string;
  type: CaseType;
  status: CaseStatus;
  priority: CasePriority;
  filingDate: string;
  lastActivity: string;
  nextHearing?: string;
  assignedJudge?: string;
  assignedCourt?: string;
  track?: string;
  parties: Party[];
  events: CaseEvent[];
  documents: CaseDocument[];
  filingFee: number;
  feePaid: boolean;
  filingReference: string;
}

// Scheduling Types
export type HearingType = 'mention' | 'trial' | 'ruling' | 'directions' | 'status' | 'settlement';
export type HearingStatus = 'scheduled' | 'completed' | 'adjourned' | 'cancelled';

export interface Hearing {
  id: string;
  caseId: string;
  caseNumber: string;
  caseTitle: string;
  type: HearingType;
  status: HearingStatus;
  date: string;
  time: string;
  duration: number;
  court: string;
  judge: string;
  notes?: string;
}

// Orders Types
export type OrderStatus = 'draft' | 'pending_review' | 'issued' | 'served' | 'executed';
export type OrderType = 'ruling' | 'injunction' | 'writ' | 'summons' | 'direction' | 'judgment';

export interface Order {
  id: string;
  caseId: string;
  caseNumber: string;
  type: OrderType;
  status: OrderStatus;
  title: string;
  content: string;
  issuedBy?: string;
  issuedDate?: string;
  servedDate?: string;
  createdAt: string;
  linkedEnforcement?: string;
}

// Sheriff/Enforcement Types
export type WritType = 'execution' | 'attachment' | 'possession' | 'arrest' | 'search';
export type ServiceStatus = 'pending' | 'attempted' | 'served' | 'failed' | 'returned';
export type EnforcementStatus = 'pending' | 'in_progress' | 'executed' | 'closed' | 'stayed';

export interface ServiceAttempt {
  id: string;
  writId: string;
  date: string;
  officer: string;
  outcome: 'served' | 'refused' | 'not_found' | 'address_incorrect' | 'other';
  notes: string;
  location?: string;
}

export interface SeizureItem {
  id: string;
  writId: string;
  description: string;
  estimatedValue: number;
  condition: string;
  location: string;
  status: 'seized' | 'stored' | 'sold' | 'returned';
  seizedDate: string;
  disposedDate?: string;
}

export interface EnforcementFee {
  id: string;
  writId: string;
  description: string;
  amount: number;
  paid: boolean;
  paidDate?: string;
  receiptNumber?: string;
}

export interface Writ {
  id: string;
  writNumber: string;
  caseId: string;
  caseNumber: string;
  orderId: string;
  type: WritType;
  status: EnforcementStatus;
  serviceStatus: ServiceStatus;
  issuedDate: string;
  expiryDate: string;
  assignedOfficer?: string;
  targetParty: string;
  targetAddress: string;
  serviceAttempts: ServiceAttempt[];
  seizureItems: SeizureItem[];
  fees: EnforcementFee[];
  totalFeesCharged: number;
  totalFeesCollected: number;
}

// Audit Types
export type AuditAction =
  | 'create' | 'update' | 'delete' | 'view' | 'login' | 'logout'
  | 'approve' | 'reject' | 'assign' | 'upload' | 'download';

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: AuditAction;
  module: string;
  entityType: string;
  entityId: string;
  description: string;
  ipAddress: string;
  previousValue?: string;
  newValue?: string;
}

// Dashboard Stats
export interface DashboardStats {
  totalActiveCases: number;
  casesFiledThisMonth: number;
  pendingHearings: number;
  pendingEnforcement: number;
  enforcementCompletionRate: number;
  averageCaseAge: number;
  revenueThisMonth: number;
  revenueLastMonth: number;
  casesByAge: { label: string; count: number; color: string }[];
  casesByType: { type: CaseType; count: number }[];
  monthlyTrend: { month: string; filed: number; closed: number }[];
  topBottlenecks: { stage: string; count: number; avgDays: number }[];
}

// Role Permissions
export interface RolePermissions {
  canCreateCase: boolean;
  canEditCase: boolean;
  canDeleteCase: boolean;
  canViewAllCases: boolean;
  canAssignJudge: boolean;
  canScheduleHearings: boolean;
  canCreateOrders: boolean;
  canIssueOrders: boolean;
  canManageEnforcement: boolean;
  canViewAuditLog: boolean;
  canManageUsers: boolean;
  canViewReports: boolean;
  canViewFinance: boolean;
  canResetDemo: boolean;
}

export const rolePermissions: Record<UserRole, RolePermissions> = {
  registrar: {
    canCreateCase: true, canEditCase: true, canDeleteCase: true, canViewAllCases: true,
    canAssignJudge: true, canScheduleHearings: true, canCreateOrders: true, canIssueOrders: true,
    canManageEnforcement: true, canViewAuditLog: true, canManageUsers: true, canViewReports: true,
    canViewFinance: true, canResetDemo: true,
  },
  registry: {
    canCreateCase: true, canEditCase: true, canDeleteCase: false, canViewAllCases: true,
    canAssignJudge: false, canScheduleHearings: true, canCreateOrders: false, canIssueOrders: false,
    canManageEnforcement: false, canViewAuditLog: false, canManageUsers: false, canViewReports: true,
    canViewFinance: false, canResetDemo: false,
  },
  judge: {
    canCreateCase: false, canEditCase: false, canDeleteCase: false, canViewAllCases: false,
    canAssignJudge: false, canScheduleHearings: true, canCreateOrders: true, canIssueOrders: true,
    canManageEnforcement: false, canViewAuditLog: false, canManageUsers: false, canViewReports: true,
    canViewFinance: false, canResetDemo: false,
  },
  associate: {
    canCreateCase: false, canEditCase: false, canDeleteCase: false, canViewAllCases: false,
    canAssignJudge: false, canScheduleHearings: true, canCreateOrders: true, canIssueOrders: false,
    canManageEnforcement: false, canViewAuditLog: false, canManageUsers: false, canViewReports: false,
    canViewFinance: false, canResetDemo: false,
  },
  sheriff: {
    canCreateCase: false, canEditCase: false, canDeleteCase: false, canViewAllCases: false,
    canAssignJudge: false, canScheduleHearings: false, canCreateOrders: false, canIssueOrders: false,
    canManageEnforcement: true, canViewAuditLog: false, canManageUsers: false, canViewReports: true,
    canViewFinance: true, canResetDemo: false,
  },
  finance: {
    canCreateCase: false, canEditCase: false, canDeleteCase: false, canViewAllCases: true,
    canAssignJudge: false, canScheduleHearings: false, canCreateOrders: false, canIssueOrders: false,
    canManageEnforcement: false, canViewAuditLog: true, canManageUsers: false, canViewReports: true,
    canViewFinance: true, canResetDemo: false,
  },
  admin: {
    canCreateCase: true, canEditCase: true, canDeleteCase: true, canViewAllCases: true,
    canAssignJudge: true, canScheduleHearings: true, canCreateOrders: true, canIssueOrders: true,
    canManageEnforcement: true, canViewAuditLog: true, canManageUsers: true, canViewReports: true,
    canViewFinance: true, canResetDemo: true,
  },
};
