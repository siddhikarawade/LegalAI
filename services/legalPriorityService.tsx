
import { LegalCase, PriorityLevel, CaseStatus } from '../types';

const SEVERITY_MAP: Record<string, number> = {
  'Extortion': 0.75,
    // 🔴 Crimes Against State
  'IPC 121': 0.99, 'BNS 145 (orig IPC 121)': 0.99, 'Waging War Against State': 0.99,
  'IPC 124A': 0.95, 'BNS 150 (orig IPC 124A)': 0.95, 'Sedition': 0.95,
  'UAPA': 1.00, 'Terrorism': 1.00,

  // 🔴 Murder / Life Threat
  'IPC 299': 0.88, 'BNS 101 (orig IPC 299)': 0.88, 'Culpable Homicide': 0.88,
  'IPC 300': 0.95, 'BNS 102 (orig IPC 300)': 0.95, 'Murder Definition': 0.95,
  'IPC 302': 0.98, 'BNS 103 (orig IPC 302)': 0.98, 'Murder': 0.98,
  'IPC 304': 0.90, 'BNS 105 (orig IPC 304)': 0.90, 'Culpable Homicide Not Murder': 0.90,
  'IPC 307': 0.92, 'BNS 109 (orig IPC 307)': 0.92, 'Attempt to Murder': 0.92,

  // 🔴 Sexual Offences
  'IPC 354': 0.85, 'BNS 74 (orig IPC 354)': 0.85, 'Outraging Modesty': 0.85,
  'IPC 376': 0.97, 'BNS 137 (orig IPC 376)': 0.97, 'Rape': 0.97,
  'IPC 376D': 0.99, 'BNS 138 (orig IPC 376D)': 0.99, 'Gang Rape': 0.99,

  // 🔴 Kidnapping
  'IPC 359': 0.80, 'BNS 135 (orig IPC 359)': 0.80, 'Kidnapping': 0.80,
  'IPC 363': 0.88, 'BNS 137 (orig IPC 363)': 0.88, 'Kidnapping from Lawful Guardianship': 0.88,
  'IPC 364A': 0.95, 'BNS 140 (orig IPC 364A)': 0.95, 'Kidnapping for Ransom': 0.95,

  // 🔴 Hurt / Assault
  'IPC 319': 0.60, 'BNS 115 (orig IPC 319)': 0.60, 'Hurt': 0.60,
  'IPC 321': 0.65, 'BNS 117 (orig IPC 321)': 0.65, 'Voluntarily Causing Hurt': 0.65,
  'IPC 325': 0.75, 'BNS 119 (orig IPC 325)': 0.75, 'Grievous Hurt': 0.75,
  'IPC 326': 0.88, 'BNS 120 (orig IPC 326)': 0.88, 'Grievous Hurt with Weapon': 0.88,
  'Assault': 0.85,

  // 🔴 Property Crimes
  'IPC 378': 0.50, 'BNS 303 (orig IPC 378)': 0.50, 'Theft': 0.50,
  'IPC 379': 0.50, 'BNS 303 (orig IPC 379)': 0.50,
  'IPC 380': 0.60, 'BNS 304 (orig IPC 380)': 0.60, 'Theft in Dwelling': 0.60,
  'IPC 392': 0.80, 'BNS 309 (orig IPC 392)': 0.80, 'Robbery': 0.80,
  'IPC 395': 0.90, 'BNS 310 (orig IPC 395)': 0.90, 'Dacoity': 0.90,

  // 🔴 Fraud / Financial
  'IPC 405': 0.60, 'BNS 316 (orig IPC 405)': 0.60, 'Criminal Breach of Trust': 0.60,
  'IPC 406': 0.60, 'BNS 316 (orig IPC 406)': 0.60,
  'IPC 409': 0.75, 'BNS 317 (orig IPC 409)': 0.75, 'Breach of Trust by Public Servant': 0.75,
  'IPC 415': 0.65, 'BNS 318 (orig IPC 415)': 0.65, 'Cheating': 0.65,
  'IPC 420': 0.70, 'BNS 318 (orig IPC 420)': 0.70, 'Cheating and Dishonestly Inducing Delivery': 0.70,
  'Fraud': 0.70,

  // 🔴 Public Order
  'IPC 141': 0.60, 'BNS 187 (orig IPC 141)': 0.60, 'Unlawful Assembly': 0.60,
  'IPC 146': 0.65, 'BNS 189 (orig IPC 146)': 0.65, 'Rioting': 0.65,
  'IPC 153A': 0.85, 'BNS 194 (orig IPC 153A)': 0.85, 'Promoting Enmity': 0.85,

  // 🟠 Domestic / Family
  'IPC 498A': 0.80, 'BNS 85 (orig IPC 498A)': 0.80, 'Cruelty by Husband': 0.80,
  'Domestic Violence': 0.75,
  'Custody': 0.65,

  // 🟠 Cyber Crime
  'IT Act 66': 0.70, 'Cyber Crime': 0.70,
  'IT Act 66B': 0.65, 'Receiving Stolen Computer Resource': 0.65,
  'IT Act 66C': 0.75, 'Identity Theft': 0.75,
  'IT Act 66D': 0.80, 'Online Cheating': 0.80,

  // 🟠 Financial / Special Laws
  'PMLA': 0.90, 'Money Laundering': 0.90,
  'NDPS': 0.92, 'Narcotics': 0.92,
  'SEBI Act': 0.75,
  'Companies Act': 0.65,

  // 🟡 Civil / Semi-Civil
  'Property Dispute': 0.55,
  'Contract Breach': 0.50,
  'Labor Dispute': 0.45,

  // 🟢 Constitutional
  'Writ Petition': 0.60,
  'Fundamental Rights': 0.75,

  // 🟢 Minor Offences
  'IPC 268': 0.30, 'BNS 270 (orig IPC 268)': 0.30, 'Public Nuisance': 0.30,
  'IPC 290': 0.25, 'BNS 292 (orig IPC 290)': 0.25, 'Minor Public Nuisance': 0.25,
};

const SENTIMENT_KEYWORDS = [
  { words: ['urgent', 'emergency', 'immediate', 'threat', 'imminent'], score: 1.0 },
  { words: ['bail', 'protection', 'restraint', 'interim'], score: 0.8 },
  { words: ['dispute', 'violation', 'non-compliance'], score: 0.4 },
];

export const calculateCasePriority = (legalCase: LegalCase): { score: number; level: PriorityLevel } => {
  // 1. Age Factor (Normalized over 365 days max)
  const createdDate = new Date(legalCase.createdAt);
  const now = new Date();
  const diffDays = Math.ceil(Math.abs(now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
  const ageScore = Math.min(diffDays / 365, 1.0);

  // 2. Severity Factor (Based on BNS/IPC mapping)
  const severityScore = SEVERITY_MAP[legalCase.matter || ''] || 0.4;

  // 3. Sentiment Factor (Heuristic scan of summary)
  let sentimentScore = 0.1;
  const lowerSummary = (legalCase.summary || '').toLowerCase();
  for (const group of SENTIMENT_KEYWORDS) {
    if (group.words.some(word => lowerSummary.includes(word))) {
      sentimentScore = Math.max(sentimentScore, group.score);
    }
  }

  // 4. Confidence Factor (Simulated Model confidence)
  const confidenceScore = 0.85; // Fixed baseline for demo

  // FORMULA: priority = age(0.4) + severity(0.3) + sentiment(0.2) + confidence(0.1)
  const finalScore = (ageScore * 0.3) + (severityScore * 0.5) + (sentimentScore * 0.2) + (confidenceScore * 0.1);

  let level = PriorityLevel.ROUTINE;
  if (finalScore > 0.7) level = PriorityLevel.HIGH;
  else if (finalScore > 0.45) level = PriorityLevel.MEDIUM;

  return { score: parseFloat(finalScore.toFixed(3)), level };
};

export const prioritizeUpcomingCases = (cases: LegalCase[]): LegalCase[] => {
  return cases
    .filter(c => c.status !== CaseStatus.DISPOSED)
    .map(c => {
      const { score, level } = calculateCasePriority(c);
      return { ...c, priorityScore: score, priorityLevel: level };
    })
    .sort((a, b) => (b.priorityScore || 0) - (a.priorityScore || 0));
};
