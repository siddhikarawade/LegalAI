
import { CaseCategory, SimilarLegalCase } from './types';

export const CASE_CATEGORIES = Object.values(CaseCategory);

/**
 * Utility to add months to a date string and return YYYY-MM-DD
 */
const addMonths = (dateStr: string, months: number): string => {
  const date = new Date(dateStr);
  date.setMonth(date.getMonth() + months);
  return date.toISOString().split('T')[0];
};

/**
 * Utility to add a random number of months within a range (min 1 for hearings)
 */
const addRandomInterval = (dateStr: string, min: number, max: number): string => {
  const months = Math.floor(Math.random() * (max - min + 1)) + min;
  return addMonths(dateStr, months);
};

const generateMockCases = (): SimilarLegalCase[] => {
  const cases: SimilarLegalCase[] = [];
  
  const indianFirstNames = ['Rahul', 'Amit', 'Suresh', 'Priya', 'Anjali', 'Vikram', 'Sanjay', 'Arjun', 'Deepa', 'Karan', 'Meera', 'Aditya'];
  const indianLastNames = ['Sharma', 'Verma', 'Khan', 'Iyer', 'Reddy', 'Patel', 'Das', 'Singh', 'Banerjee', 'Chatterjee', 'Rao', 'Nair'];
  const cities = ['Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Ahmedabad', 'Pune'];

  const getRandomIndividual = (idx: number) => {
    return `${indianFirstNames[idx % indianFirstNames.length]} ${indianLastNames[(idx + 2) % indianLastNames.length]}`;
  };

  const categorySpecificData: Record<CaseCategory, { landmark: Partial<SimilarLegalCase>[], topics: string[], judgmentTemplates: string[] }> = {
    [CaseCategory.CIVIL]: {
      landmark: [
        { 
          title: 'Salem Advocate Bar Association v. Union of India', 
          summary: 'Landmark judgment establishing the procedural framework for mediation and conciliation in civil suits under Section 89 of CPC.', 
          court: 'Supreme Court of India',
          judgment: 'The court upheld the constitutional validity of the amendments to the CPC and directed the implementation of mediation rules across all High Courts to reduce pendency.'
        }
      ],
      topics: ['Property Partition', 'Contract Breach', 'Defamation Suit', 'Tenant Eviction', 'Consumer Rights', 'Easement Dispute', 'Specific Performance', 'Money Recovery', 'Tort Claim'],
      judgmentTemplates: ['Decree passed in favor of the plaintiff for recovery of possession.', 'Suit dismissed as barred by limitation.', 'Specific performance granted with a direction to deposit the balance consideration within 30 days.']
    },
    [CaseCategory.CRIMINAL]: {
      landmark: [
        { 
          title: 'D.K. Basu v. State of West Bengal', 
          summary: 'Fundamental guidelines for the rights of arrested persons and prevention of custodial torture.', 
          court: 'Supreme Court of India',
          judgment: 'The court laid down 11 mandatory guidelines to be followed in all cases of arrest or detention, making non-compliance punishable as contempt of court.'
        }
      ],
      topics: [
        'Murder (Section 302)', 
        'Criminal Battery', 
        'Culpable Homicide', 
        'Attempted Murder', 
        'Grievous Hurt', 
        'Aggravated Assault', 
        'Manslaughter', 
        'Criminal Force'
      ],
      judgmentTemplates: [
        'Accused found guilty and sentenced to life imprisonment.', 
        'Convicted for Culpable Homicide not amounting to murder; sentenced to 10 years rigorous imprisonment.', 
        'Acquitted as the prosecution failed to prove intent beyond reasonable doubt.',
        'Sentenced to 7 years for criminal battery causing permanent disability.'
      ]
    },
    [CaseCategory.FAMILY]: {
      landmark: [
        { 
          title: 'Shayara Bano v. Union of India', 
          summary: 'Historic ruling declaring the practice of Triple Talaq as unconstitutional and violating gender equality.', 
          court: 'Supreme Court of India',
          judgment: 'By a 3:2 majority, the court set aside the practice of "talaq-e-biddat" (Triple Talaq), finding it arbitrary and violative of Article 14.'
        }
      ],
      topics: ['Maintenance Claim', 'Child Custody', 'Domestic Violence', 'Divorce Petition', 'Adoption Rights', 'HUF Partition', 'Alimony Dispute', 'Marriage Validity', 'Guardianship'],
      judgmentTemplates: ['Divorce granted on grounds of cruelty; permanent alimony fixed at ₹50,000 per month.', 'Joint custody awarded with visitation rights every alternate weekend.', 'Petition for restitution of conjugal rights dismissed.']
    },
    [CaseCategory.CONSTITUTIONAL]: {
      landmark: [
        { 
          title: 'Kesavananda Bharati v. State of Kerala', 
          summary: 'The most significant case defining the Basic Structure Doctrine of the Indian Constitution.', 
          court: 'Supreme Court of India',
          judgment: 'The court held that while Parliament has wide powers to amend the Constitution, it cannot alter its "Basic Structure".'
        }
      ],
      topics: ['Right to Privacy', 'Freedom of Speech', 'Reservation Policy', 'Writ Petition', 'Religious Autonomy', 'Environmental Rights', 'Judicial Review', 'Federalism', 'Fundamental Duties'],
      judgmentTemplates: ['Writ of Mandamus issued to the state authorities.', 'Statute struck down as ultra vires to the Constitution.', 'Petition dismissed; no violation of fundamental rights found.']
    },
    [CaseCategory.COMMERCIAL]: {
      landmark: [
        { 
          title: 'Bharat Aluminium Co v. Kaiser Aluminium', 
          summary: 'Landmark arbitration case determining the seat and venue of international commercial arbitration.', 
          court: 'Supreme Court of India',
          judgment: 'The court ruled that Part I of the Arbitration Act does not apply to foreign-seated arbitrations, adopting a seat-centric approach.'
        }
      ],
      topics: ['IP Infringement', 'Arbitration Dispute', 'Insolvency Proceeding', 'Shareholder Conflict', 'Merger Approval', 'Competition Law', 'FDI Regulation', 'Mining Lease', 'Franchise Dispute'],
      judgmentTemplates: ['Arbitral award upheld; execution petition allowed.', 'Interim injunction made absolute pending final arbitration.', 'Insolvency resolution plan approved by the Adjudicating Authority.']
    },
    [CaseCategory.LABOR]: {
      landmark: [
        { 
          title: 'Bangalore Water Supply v. A. Rajappa', 
          summary: 'Defines the scope of "Industry" under the Industrial Disputes Act, covering various types of organizations.', 
          court: 'Supreme Court of India',
          judgment: 'The court adopted a "triple test" (systematic activity, cooperation, production of goods/services) to define an industry.'
        }
      ],
      topics: ['Unfair Dismissal', 'Minimum Wage', 'Trade Union Recognition', 'Workplace Safety', 'Bonus Payment', 'Contractual Labor', 'PF Contribution', 'Industrial Lockout', 'Gratuity Dispute'],
      judgmentTemplates: ['Reinstatement ordered with 50% back wages.', 'Termination found lawful; no relief granted.', 'Direction issued to pay minimum wages as per the latest notification.']
    },
    [CaseCategory.TAXATION]: {
      landmark: [
        { 
          title: 'Vodafone International Holdings v. Union of India', 
          summary: 'Critical ruling on the taxation of cross-border mergers and acquisitions involving Indian assets.', 
          court: 'Supreme Court of India',
          judgment: 'The court held that the sale of shares in a foreign company between two non-residents is not taxable in India even if the foreign company holds Indian assets.'
        }
      ],
      topics: ['GST Assessment', 'Income Tax Evasion', 'Customs Duty', 'Service Tax', 'Transfer Pricing', 'Search & Seizure', 'Wealth Tax', 'Dividend Tax', 'Excise Refund'],
      judgmentTemplates: ['Assessment order set aside; matter remanded for fresh consideration.', 'Penalty reduced to 10% of the disputed tax amount.', 'Appeal allowed; refund of excess duty ordered with interest.']
    }
  };

  CASE_CATEGORIES.forEach(cat => {
    const data = categorySpecificData[cat];
    
    data.landmark.forEach((l, idx) => {
      const filedDate = '1970-10-15';
      const hearing1 = addMonths(filedDate, 4); 
      const hearing2 = addMonths(hearing1, 8); 
      const judgmentDate = '1973-04-24';
      
      cases.push({
        id: `${cat.toLowerCase().replace(/\s+/g, '-')}-landmark-${idx}`,
        title: l.title || '',
        caseNumber: `IND-${cat.substring(0,3).toUpperCase().replace(/\s+/g, '')}-LMRK-${100 + idx}`,
        category: cat,
        dateFiled: filedDate,
        status: 'Closed',
        court: l.court || 'Supreme Court of India',
        judgment: l.judgment || 'Final judgment delivered by the full bench.',
        parties: [l.title?.split(' v. ')[0] || 'Petitioner', l.title?.split(' v. ')[1] || 'Respondent'],
        summary: l.summary || '',
        timeline: [
          { date: filedDate, topic: 'Suit Filed', details: 'Initial petition entered into records.' },
          { date: hearing1, topic: 'Preliminary Hearing', details: 'Court reviewed the maintainability of the petition.' },
          { date: hearing2, topic: 'Arguments Commenced', details: 'Counsel for the parties opened submissions.' },
          { date: judgmentDate, topic: 'Final Judgment', details: 'Full Bench delivered final ruling.' }
        ],
        precedents: []
      });
    });

    for (let i = cases.filter(c => c.category === cat).length; i < 10; i++) {
      const p1 = getRandomIndividual(i);
      const p2 = getRandomIndividual(i + 15);
      const city = cities[i % cities.length];
      const topic = data.topics[i % data.topics.length];
      const year = 2014 + (i % 6);
      
      const filedDate = `${year}-01-10`;
      const dateH1 = addRandomInterval(filedDate, 2, 3); // Min 2 months
      const dateH2 = addRandomInterval(dateH1, 2, 3);   // Min 2 months
      const dateH3 = addRandomInterval(dateH2, 2, 3);   // Min 2 months
      const judgmentDate = addRandomInterval(dateH3, 2, 4); // Total usually > 8 months

      const isCriminal = cat === CaseCategory.CRIMINAL;
      const partySuffix1 = isCriminal ? '' : ' & Co.';
      const partySuffix2 = isCriminal ? '' : ' Enterprises';

      cases.push({
        id: `${cat.toLowerCase().replace(/\s+/g, '-')}-${i}`,
        title: `${p1}${partySuffix1} vs. ${p2}${partySuffix2} (${topic})`,
        caseNumber: `IND-${cat.substring(0,3).toUpperCase().replace(/\s+/g, '')}-${year}-${1000 + i}`,
        category: cat,
        dateFiled: filedDate,
        status: 'Closed',
        court: i % 2 === 0 ? `High Court of ${city}` : `District Court of ${city}`,
        judgment: data.judgmentTemplates[i % data.judgmentTemplates.length],
        parties: [`${p1}${partySuffix1}`, `${p2}${partySuffix2}`],
        summary: `A legal dispute regarding ${topic.toLowerCase()} within the jurisdiction of ${city}. The case involved detailed scrutiny of ${isCriminal ? 'the individual conduct of both parties' : 'contractual obligations and business ethics'}.`,
        timeline: [
          { date: filedDate, topic: 'Case Filing', details: 'Formal documentation submitted to the registry.' },
          { date: dateH1, topic: 'First Hearing', details: 'Admission hearing to establish a prima facie case.' },
          { date: dateH2, topic: 'Evidence Recording', details: 'Key testimonies recorded under oath.' },
          { date: dateH3, topic: 'Final Arguments', details: 'Conclusive legal submissions by senior counsels.' },
          { date: judgmentDate, topic: 'Final Judgment', details: 'The court pronounced the final verdict and closed the case file.' }
        ],
        precedents: [{ caseName: data.landmark[0].title || 'Relevant Landmark', relevance: 'Governing legal principle for similar disputes.' }]
      });
    }
  });

  // 8 Specific Theft Cases between individuals (preserving the criminal "battery/murder/homicide" style structure)
  const theftCasesData = [
    { p1: 'Vikram Singh', p2: 'Rajesh G.', item: 'Golden Ornaments', city: 'Mumbai', year: 2019 },
    { p1: 'Anjali Sharma', p2: 'Arun Verma', item: 'Antique Watch', city: 'Chennai', year: 2020 },
    { p1: 'Deepa Das', p2: 'Karan Mehra', item: 'Luxury Car', city: 'Delhi', year: 2021 },
    { p1: 'Suresh Iyer', p2: 'Amit Reddy', item: 'Laptop and Gadgets', city: 'Bangalore', year: 2018 },
    { p1: 'Priya Nair', p2: 'Sanjay Rao', item: 'Heritage Coin Collection', city: 'Pune', year: 2022 },
    { p1: 'Aditya Patel', p2: 'Hiralal Shah', item: 'Industrial Copper Cables', city: 'Ahmedabad', year: 2017 },
    { p1: 'Meera Iyer', p2: 'Rahul Khan', item: 'Designer Handbags', city: 'Kolkata', year: 2021 },
    { p1: 'Anjali Reddy', p2: 'Vikram Das', item: 'Electric Scooter', city: 'Hyderabad', year: 2019 }
  ];

  theftCasesData.forEach((tc, i) => {
    const filedDate = `${tc.year}-02-15`;
    const h1 = addMonths(filedDate, 2); // +2 months
    const h2 = addMonths(h1, 3); // +3 months (total 5)
    const judgmentDate = addMonths(h2, 4); // +4 months (total 9) - satisfies > 6 months
    
    cases.push({
      id: `theft-case-${i}`,
      title: `${tc.p1} vs. ${tc.p2} (Theft of ${tc.item})`,
      caseNumber: `IND-CRIM-${tc.year}-THFT-${2000 + i}`,
      category: CaseCategory.CRIMINAL,
      dateFiled: filedDate,
      status: 'Closed',
      court: `District Court of ${tc.city}`,
      judgment: `After reviewing the circumstantial evidence and the recovered property, the court finds ${tc.p2} guilty of theft under Section 379 of the IPC. Sentenced to 3 years imprisonment and a fine of ₹10,000.`,
      parties: [tc.p1, tc.p2],
      summary: `Criminal proceedings initiated by ${tc.p1} against ${tc.p2} for the dishonest misappropriation of ${tc.item.toLowerCase()}. The case relied on CCTV footage and recovery panchnama.`,
      timeline: [
        { date: filedDate, topic: 'FIR and Charge Sheet', details: 'Formal charges framed after initial investigation.' },
        { date: h1, topic: 'Evidence Recording', details: 'Complainant testified and identified recovered items.' },
        { date: h2, topic: 'Defense Arguments', details: 'Arguments regarding lack of direct intent were dismissed.' },
        { date: judgmentDate, topic: 'Final Judgment', details: 'Guilty verdict pronounced; case closed.' }
      ],
      precedents: [{ caseName: 'K.N. Mehra v. State of Rajasthan', relevance: 'Interpretation of dishonest intention in theft.' }]
    });
  });

  return cases;
};

export const INITIAL_MOCK_CASES = generateMockCases();
