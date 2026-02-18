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
  gpsCoordinates?: string;
  witnessName?: string;
  signature?: string; // Base64 encoded signature image
  timestamp?: number; // For offline sync
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
  photos?: string[]; // Array of Base64 encoded images
  gpsCoordinates?: string;
  timestamp?: number; // For offline sync
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
  instructions: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  serviceAttempts: ServiceAttempt[];
  seizureItems: SeizureItem[];
  fees: EnforcementFee[];
  totalFeesCharged: number;
  totalFeesCollected: number;
  lastModified?: number; // For offline sync
}

export interface Officer {
  id: string;
  name: string;
  badge: string;
  email: string;
  phone: string;
  zone?: string;
}

export interface OfflineQueue {
  id: string;
  action: 'service_attempt' | 'seizure' | 'update_writ';
  data: ServiceAttempt | SeizureItem | Writ;
  timestamp: number;
  synced: boolean;
}
