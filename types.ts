
export enum UserRole {
  JUDGE = 'JUDGE',
  ADVOCATE = 'ADVOCATE',
  REGISTRY = 'REGISTRY',
  LITIGANT = 'LITIGANT',
  ADMIN = 'ADMIN'
}

export enum CaseStatus {
  SUBMITTED = 'SUBMITTED',
  UNDER_SCRUTINY = 'UNDER_SCRUTINY',
  WRONG_DOCS = 'WRONG_DOCS',
  INSTITUTED = 'INSTITUTED',
  HEARING_1 = 'HEARING_1',
  HEARING_2 = 'HEARING_2',
  DISPOSED = 'DISPOSED'
}

export const CASE_CATEGORIES = {
  CRIMINAL: ['Murder', 'Theft', 'Assault', 'Fraud', 'Cyber Crime', 'Narcotics', 'Extortion'],
  FAMILY: ['Custody', 'Divorce', 'Inheritance', 'Alimony', 'Guardianship', 'Domestic Violence'],
  CIVIL: ['Property Dispute', 'Contract Breach', 'Torts', 'Labor Dispute', 'Intellectual Property', 'Consumer Rights'],
  CONSTITUTIONAL: ['Writ Petition', 'Fundamental Rights', 'PIL', 'Election Dispute'],
};

export enum PriorityLevel {
  ROUTINE = 'ROUTINE',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  password?: string;
  role: UserRole;
}

export interface LegalDocument {
  id: string;
  name: string;
  type: string;
  uploadedBy: string;
  uploadDate: string;
  fileUrl: string;
  party: 'PLAINTIFF' | 'RESPONDENT' | 'COURT';
  hearingStage: 'H0' | 'H1' | 'H2' | 'FINAL' | 'PREVIOUS';
}

export interface Hearing {
  id: string;
  date: string;
  purpose: string;
  outcome?: string;
  stage: number;
  status: CaseStatus;
}

export interface LegalCase {
  id: string;
  caseNo: string;
  type: string;
  matter?: string;
  courtName: string;
  status: CaseStatus;
  plaintiff: string;
  respondent: string;
  plaintiff_aadhar: string;
  plaintiff_id_type: 'PAN' | 'LICENSE';
  plaintiff_id_no: string;
  advocatePlaintiff?: string;
  advocateRespondent?: string;
  judgeName?: string;
  nextHearingDate?: string;
  summary?: string;
  filed_by_name: string;
  documents: LegalDocument[];
  hearings: Hearing[];
  priorityScore?: number;
  priorityLevel?: PriorityLevel;
  createdAt: string;
}

export interface PrecedentResult {
  title: string;
  type: string;
  matter: string;
  court: string;
  year: number;
  summary: string;
  judgment: string;
  fileUrl: string;
}

export enum CaseCategory {
  CIVIL = 'Civil Case',
  CRIMINAL = 'Criminal',
  FAMILY = 'Family Case',
  CONSTITUTIONAL = 'Constitutional Case',
  COMMERCIAL = 'Commercial Case',
  LABOR = 'Labor Case',
  TAXATION = 'Taxation Case'
}

export type SimilarCaseStatus = 'Closed' | 'Ongoing' | 'Appealed' | 'Dismissed';

export interface TimelineEvent {
  date: string;
  topic: string;
  details?: string;
}

export interface Precedent {
  caseName: string;
  relevance: string;
}

export interface SimilarLegalCase {
  id: string;
  title: string;
  caseNumber: string;
  category: CaseCategory;
  dateFiled: string;
  status: SimilarCaseStatus;
  court: string;
  summary: string;
  judgment: string;
  parties: string[];
  timeline: TimelineEvent[];
  precedents: Precedent[];
}

export interface SearchCriteria {
  searchText: string;
  category: CaseCategory | 'All';
  dateFrom?: string;
  dateTo?: string;
  status?: SimilarCaseStatus | 'All';
}
