import { User, LegalCase, UserRole, CaseStatus } from './types';
import React from 'react';


export const INITIAL_USERS: User[] = [
  { id: '1', name: 'Hon. Justice Verma', username: 'judge1', email: 'judge@court.gov', role: UserRole.JUDGE },
  { id: '2', name: 'Adv. Rajesh Khanna', username: 'advocate1', email: 'khanna@legal.com', role: UserRole.ADVOCATE },
  { id: '3', name: 'Registry Officer S. Kapoor', username: 'registry1', email: 'registry@court.gov', role: UserRole.REGISTRY },
  { id: '4', name: 'Wazir Singh', username: 'litigant1', email: 'arjun@gmail.com', role: UserRole.LITIGANT },
  { id: '5', name: 'System Admin', username: 'admin', email: 'admin@lexstream.com', role: UserRole.ADMIN },
];

export const INITIAL_CASES: LegalCase[] = [
  {
    id: 'demo-case-1',
    caseNo: 'CIV/2024/777',
    type: 'CIVIL',
    matter: 'Contract Breach',
    courtName: 'High Court of Delhi',
    status: CaseStatus.DISPOSED,
    plaintiff: 'Arjun Singh',
    respondent: 'Cyber-Infrastructures Ltd.',
    plaintiff_aadhar: '123456789012',
    plaintiff_id_type: 'PAN',
    plaintiff_id_no: 'ABCDE1234F',
    advocatePlaintiff: 'Adv. Rajesh Khanna',
    advocateRespondent: 'Adv. Megha Iyer',
    judgeName: 'Hon. Justice Verma',
    summary: 'A multi-year contract breach involving non-delivery of software modules. Digital evidence confirmed the breach.',
    filed_by_name: 'Arjun Singh',
    createdAt: '2023-01-10',
    documents: [
      { id: 'd1', name: 'Plaint', type: 'PDF', uploadedBy: 'Advocate', uploadDate: '2023-01-10', fileUrl: 'sample.pdf', party: 'PLAINTIFF', hearingStage: 'H0' },
      { id: 'd2', name: 'Written Statement', type: 'PDF', uploadedBy: 'Advocate', uploadDate: '2023-03-20', fileUrl: 'sample.pdf', party: 'RESPONDENT', hearingStage: 'H1' },
      { id: 'd3', name: 'Final Judgment', type: 'PDF', uploadedBy: 'Judge', uploadDate: '2024-05-10', fileUrl: 'judgment.pdf', party: 'COURT', hearingStage: 'FINAL' },
    ],
    hearings: [
      { id: 'h0', date: '2023-01-10', purpose: 'Filing', stage: 0, outcome: 'Instituted.', status: CaseStatus.INSTITUTED },
      { id: 'h1', date: '2023-02-15', purpose: 'Admission', stage: 1, outcome: 'Notices issued.', status: CaseStatus.SUBMITTED },
      { id: 'h2', date: '2024-05-01', purpose: 'Final Arguments', stage: 2, outcome: 'Disposed with judgment.', status: CaseStatus.DISPOSED }
    ]
  },
  {
    id: 'demo-case-2',
    caseNo: 'CRM/2024/888',
    type: 'CRIMINAL',
    matter: 'Theft',
    courtName: 'District Court, Noida',
    status: CaseStatus.INSTITUTED,
    plaintiff: 'State of UP',
    respondent: 'Vikas Oberoi',
    plaintiff_aadhar: '987654321098',
    plaintiff_id_type: 'LICENSE',
    plaintiff_id_no: 'DL1234567890123',
    advocatePlaintiff: 'Public Prosecutor',
    judgeName: 'Hon. Justice Verma',
    nextHearingDate: '2024-07-20',
    summary: 'Theft of electronic components from a warehouse. Investigation in progress.',
    filed_by_name: 'State of UP',
    createdAt: '2024-02-15',
    documents: [
      { id: 'd4', name: 'First Information Report (FIR)', type: 'PDF', uploadedBy: 'Registry', uploadDate: '2024-02-15', fileUrl: 'sample.pdf', party: 'PLAINTIFF', hearingStage: 'H0' },
    ],
    hearings: [
      { id: 'h3', date: '2024-03-10', purpose: 'Bail Application', stage: 1, outcome: 'Bail rejected.', status: CaseStatus.INSTITUTED }
    ]
  },
  {
    id: 'demo-case-3',
    caseNo: 'FAM/2024/101',
    type: 'FAMILY',
    matter: 'Custody',
    courtName: 'Family Court, Saket',
    status: CaseStatus.UNDER_SCRUTINY,
    plaintiff: 'Sonia Sharma',
    respondent: 'Amit Sharma',
    plaintiff_aadhar: '555566667777',
    plaintiff_id_type: 'PAN',
    plaintiff_id_no: 'FGHIJ5678K',
    advocatePlaintiff: 'Adv. Rajesh Khanna',
    filed_by_name: 'Sonia Sharma',
    createdAt: '2024-05-30',
    documents: [
      { id: 'd5', name: 'Petition for Custody', type: 'PDF', uploadedBy: 'Advocate', uploadDate: '2024-05-30', fileUrl: 'sample.pdf', party: 'PLAINTIFF', hearingStage: 'H0' },
    ],
    hearings: []
  },
  {
    id: 'demo-case-4',
    caseNo: 'CIV/2024/202',
    type: 'CIVIL',
    matter: 'Property Dispute',
    courtName: 'High Court of Bombay',
    status: CaseStatus.SUBMITTED,
    plaintiff: 'Mehta Estates',
    respondent: 'Municipal Corp.',
    plaintiff_aadhar: '111122223333',
    plaintiff_id_type: 'PAN',
    plaintiff_id_no: 'KLMNO9012P',
    filed_by_name: 'Mehta Estates',
    createdAt: '2024-06-05',
    documents: [],
    hearings: []
  },
  {
    id: 'demo-case-5',
    caseNo: 'CIV/2025/555',
    type: 'CIVIL',
    matter: 'Service Seniority Dispute (AEE Appointments)',
    courtName: 'Supreme Court, Andhra Pradesh',
    status: CaseStatus.DISPOSED, // Case in process after filing & admission
    plaintiff: 'P. Rammohan Rao',
    respondent: 'K. Srinivas & Ors. (State of Andhra Pradesh)',
    plaintiff_aadhar: '222233334444',
    plaintiff_id_type: 'PAN',
    plaintiff_id_no: 'PRRMO1234Q',
    advocatePlaintiff: 'Senior Counsel (Service Law)',
    advocateRespondent: 'State Counsel, Andhra Pradesh',
    judgeName: 'Vikram Nath, Sanjay Karol',
    filed_by_name: 'P. Rammohan Rao',
    createdAt: '2025-03-01',
    documents: [
    {
      id: 'd1',
      name: 'Civil Suit Plaint',
      type: 'PDF',
      uploadedBy: 'Plaintiff',
      uploadDate: '2025-03-01',
      fileUrl: '/documents/d5_plaint.pdf',
      party: 'PLAINTIFF',
      hearingStage: 'H0' // Filing
    },
    {
      id: 'd2',
      name: 'Affidavit',
      type: 'PDF',
      uploadedBy: 'Plaintiff',
      uploadDate: '2025-03-01',
      fileUrl: '/documents/d5_affidavit.pdf',
      party: 'PLAINTIFF',
      hearingStage: 'H0'
    },
    {
      id: 'd3',
      name: 'Supporting Evidence',
      type: 'PDF',
      uploadedBy: 'Plaintiff',
      uploadDate: '2025-03-01',
      fileUrl: '/documents/d5_evidence.pdf',
      party: 'PLAINTIFF',
      hearingStage: 'H0'
    },
    {
      id: 'd4',
      name: 'Vakalatnama',
      type: 'PDF',
      uploadedBy: 'Plaintiff',
      uploadDate: '2025-03-01',
      fileUrl: '/documents/d5_vakalatnama.pdf',
      party: 'PLAINTIFF',
      hearingStage: 'H0'
    },
    {
      id: 'd5',
      name: 'Order Sheet (Admission)',
      type: 'PDF',
      uploadedBy: 'Judge',
      uploadDate: '2025-03-10',
      fileUrl: '/documents/d5_ordersheet.pdf',
      party: 'COURT',
      hearingStage: 'H1' // Admission
    },
    {
      id: 'd6',
      name: 'Issued Summons',
      type: 'PDF',
      uploadedBy: 'Court Registry',
      uploadDate: '2025-03-15',
      fileUrl: '/documents/d5_summons.pdf',
      party: 'RESPONDENT',
      hearingStage: 'H1'
    },
    {
      id: 'd7',
      name: 'Supreme Court Judgment (13.02.2025)',
      type: 'PDF',
      uploadedBy: 'Judge',
      uploadDate: '2025-02-13',
      fileUrl: '/documents/d5_judgment.pdf',
      party: 'COURT',
      hearingStage: 'FINAL' // Reference for case
    }
  ]
  ,

  hearings: [
  {
    id: 'h0',
    date: '2025-03-01',
    purpose: 'Filing of Suit',
    stage: 0,
    outcome: 'Plaint, Affidavit, Evidence, and Vakalatnama submitted.',
    status: CaseStatus.INSTITUTED
  },
  {
    id: 'h1',
    date: '2025-03-10',
    purpose: 'Admission',
    stage: 1,
    outcome: 'Order sheet issued; case admitted.',
    status: CaseStatus.SUBMITTED
  },
  {
    id: 'h2',
    date: '2025-03-15',
    purpose: 'Issuance of Summons',
    stage: 2,
    outcome: 'Summons issued to defendants.',
    status: CaseStatus.SUBMITTED
  }

]

  }

];

const getStoredData = <T,>(key: string, defaultValue: T): T => {
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : defaultValue;
};

export const getUsers = () => getStoredData<User[]>('users', INITIAL_USERS);

export const saveUser = (user: User) => {
  const users = getUsers();
  users.push(user);
  localStorage.setItem('users', JSON.stringify(users));
};

export const getCases = () => {
  return getStoredData<LegalCase[]>('cases', INITIAL_CASES);
};


export const getEffectiveCaseStatus = (c: LegalCase): CaseStatus => {
  if (!c.hearings.length) return c.status;

  const latest = [...c.hearings].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )[0];

  return latest.status;
};


export const saveCase = (legalCase: LegalCase) => {
  const cases = getCases();
  const index = cases.findIndex(c => c.id === legalCase.id);
  if (index >= 0) {
    cases[index] = legalCase;
  } else {
    cases.push(legalCase);
  }
  localStorage.setItem('cases', JSON.stringify(cases));
};

export const getCaseById = (id: string) => getCases().find(c => c.id === id);
