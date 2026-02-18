import type { Writ, Officer } from './types';

export const currentOfficer: Officer = {
  id: 'off-001',
  name: 'James Mwangi',
  badge: 'SH-2456',
  email: 'j.mwangi@sheriff.ke',
  phone: '+254 712 345 678',
  zone: 'Nairobi Central'
};

export const mockWrits: Writ[] = [
  {
    id: 'wrt-001',
    writNumber: 'WRT/2024/001234',
    caseId: 'case-001',
    caseNumber: 'HCCC/123/2024',
    orderId: 'ord-001',
    type: 'execution',
    status: 'in_progress',
    serviceStatus: 'attempted',
    issuedDate: '2024-02-01',
    expiryDate: '2024-03-01',
    assignedOfficer: 'James Mwangi',
    targetParty: 'Acme Trading Ltd',
    targetAddress: 'Riverside Drive, Plot 45, Nairobi',
    instructions: 'Execute judgment for KES 2,500,000. Seize movable assets if payment not made. Priority execution.',
    priority: 'high',
    serviceAttempts: [
      {
        id: 'sa-001',
        writId: 'wrt-001',
        date: '2024-02-05',
        officer: 'James Mwangi',
        outcome: 'not_found',
        notes: 'Premises closed. Security guard indicated business relocated.',
        location: 'Riverside Drive, Plot 45',
        gpsCoordinates: '-1.2632, 36.8082'
      },
      {
        id: 'sa-002',
        writId: 'wrt-001',
        date: '2024-02-08',
        officer: 'James Mwangi',
        outcome: 'refused',
        notes: 'Director present but refused to accept service. Witness: Security guard Michael Otieno',
        location: 'New location: Karen Business Park, Unit 12',
        gpsCoordinates: '-1.3207, 36.7073',
        witnessName: 'Michael Otieno'
      }
    ],
    seizureItems: [
      {
        id: 'sz-001',
        writId: 'wrt-001',
        description: 'Office furniture set - 3 desks, 6 chairs, filing cabinets',
        estimatedValue: 150000,
        condition: 'Good condition, minimal wear',
        location: 'Central Police Station - Evidence Room A',
        status: 'stored',
        seizedDate: '2024-02-08'
      },
      {
        id: 'sz-002',
        writId: 'wrt-001',
        description: 'HP LaserJet Printer and Dell Desktop Computer',
        estimatedValue: 85000,
        condition: 'Excellent working condition',
        location: 'Central Police Station - Evidence Room A',
        status: 'stored',
        seizedDate: '2024-02-08'
      }
    ],
    fees: [
      {
        id: 'fee-001',
        writId: 'wrt-001',
        description: 'Writ execution fee',
        amount: 5000,
        paid: true,
        paidDate: '2024-02-01',
        receiptNumber: 'RCP-001234'
      },
      {
        id: 'fee-002',
        writId: 'wrt-001',
        description: 'Service attempt fees (2 attempts)',
        amount: 4000,
        paid: true,
        paidDate: '2024-02-09',
        receiptNumber: 'RCP-001240'
      },
      {
        id: 'fee-003',
        writId: 'wrt-001',
        description: 'Seizure and storage fee',
        amount: 7500,
        paid: false
      }
    ],
    totalFeesCharged: 16500,
    totalFeesCollected: 9000
  },
  {
    id: 'wrt-002',
    writNumber: 'WRT/2024/001567',
    caseId: 'case-002',
    caseNumber: 'CMCC/456/2024',
    orderId: 'ord-002',
    type: 'attachment',
    status: 'pending',
    serviceStatus: 'pending',
    issuedDate: '2024-02-10',
    expiryDate: '2024-03-10',
    assignedOfficer: 'James Mwangi',
    targetParty: 'John Kamau',
    targetAddress: 'Muthaiga Estate, House No. 67, Nairobi',
    instructions: 'Attach property to secure debt of KES 850,000. Serve notice of attachment.',
    priority: 'medium',
    serviceAttempts: [],
    seizureItems: [],
    fees: [
      {
        id: 'fee-004',
        writId: 'wrt-002',
        description: 'Writ execution fee',
        amount: 5000,
        paid: true,
        paidDate: '2024-02-10',
        receiptNumber: 'RCP-001245'
      }
    ],
    totalFeesCharged: 5000,
    totalFeesCollected: 5000
  },
  {
    id: 'wrt-003',
    writNumber: 'WRT/2024/001890',
    caseId: 'case-003',
    caseNumber: 'HCCC/789/2024',
    orderId: 'ord-003',
    type: 'possession',
    status: 'in_progress',
    serviceStatus: 'served',
    issuedDate: '2024-02-12',
    expiryDate: '2024-03-12',
    assignedOfficer: 'James Mwangi',
    targetParty: 'Mary Njeri',
    targetAddress: 'Kilimani, Argwings Kodhek Road, Apt 5B',
    instructions: 'Evict tenant and deliver possession to landlord. Ensure peaceful handover.',
    priority: 'urgent',
    serviceAttempts: [
      {
        id: 'sa-003',
        writId: 'wrt-003',
        date: '2024-02-13',
        officer: 'James Mwangi',
        outcome: 'served',
        notes: 'Notice served to tenant. Informed of 7-day grace period. Tenant acknowledged receipt.',
        location: 'Kilimani, Argwings Kodhek Road, Apt 5B',
        gpsCoordinates: '-1.2884, 36.7861',
        witnessName: 'Building caretaker - David Odhiambo'
      }
    ],
    seizureItems: [],
    fees: [
      {
        id: 'fee-005',
        writId: 'wrt-003',
        description: 'Writ execution fee',
        amount: 5000,
        paid: true,
        paidDate: '2024-02-12',
        receiptNumber: 'RCP-001250'
      },
      {
        id: 'fee-006',
        writId: 'wrt-003',
        description: 'Service fee',
        amount: 2000,
        paid: true,
        paidDate: '2024-02-13',
        receiptNumber: 'RCP-001252'
      }
    ],
    totalFeesCharged: 7000,
    totalFeesCollected: 7000
  },
  {
    id: 'wrt-004',
    writNumber: 'WRT/2024/002001',
    caseId: 'case-004',
    caseNumber: 'CMCC/234/2024',
    orderId: 'ord-004',
    type: 'search',
    status: 'pending',
    serviceStatus: 'pending',
    issuedDate: '2024-02-15',
    expiryDate: '2024-02-20',
    assignedOfficer: 'James Mwangi',
    targetParty: 'Tech Solutions Kenya Ltd',
    targetAddress: 'Westlands, Chiromo Road, Office Block C',
    instructions: 'Search premises for specified documents related to fraud case. Coordinate with investigating officer.',
    priority: 'urgent',
    serviceAttempts: [],
    seizureItems: [],
    fees: [
      {
        id: 'fee-007',
        writId: 'wrt-004',
        description: 'Search warrant execution fee',
        amount: 3000,
        paid: false
      }
    ],
    totalFeesCharged: 3000,
    totalFeesCollected: 0
  },
  {
    id: 'wrt-005',
    writNumber: 'WRT/2024/002134',
    caseId: 'case-005',
    caseNumber: 'HCCC/567/2023',
    orderId: 'ord-005',
    type: 'execution',
    status: 'executed',
    serviceStatus: 'served',
    issuedDate: '2024-01-15',
    expiryDate: '2024-02-15',
    assignedOfficer: 'James Mwangi',
    targetParty: 'Global Imports Co.',
    targetAddress: 'Industrial Area, Mombasa Road, Warehouse 23',
    instructions: 'Execute judgment for KES 1,200,000. Payment received in full.',
    priority: 'low',
    serviceAttempts: [
      {
        id: 'sa-004',
        writId: 'wrt-005',
        date: '2024-01-20',
        officer: 'James Mwangi',
        outcome: 'served',
        notes: 'Writ served. Company director agreed to payment plan. Full payment received.',
        location: 'Industrial Area, Mombasa Road, Warehouse 23',
        gpsCoordinates: '-1.3201, 36.8520'
      }
    ],
    seizureItems: [],
    fees: [
      {
        id: 'fee-008',
        writId: 'wrt-005',
        description: 'Writ execution fee',
        amount: 5000,
        paid: true,
        paidDate: '2024-01-15',
        receiptNumber: 'RCP-001100'
      },
      {
        id: 'fee-009',
        writId: 'wrt-005',
        description: 'Service fee',
        amount: 2000,
        paid: true,
        paidDate: '2024-01-20',
        receiptNumber: 'RCP-001105'
      }
    ],
    totalFeesCharged: 7000,
    totalFeesCollected: 7000
  }
];
