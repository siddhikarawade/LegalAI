import { GoogleGenAI, Type } from "@google/genai";
import { SimilarLegalCase, CaseCategory } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const summarizeLegalDoc = async (docName: string, content: string) => {
  try {
    const response = await getAI().models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: `
        You are a senior judicial assistant. Read the legal document titled "${docName}" and generate a clear, professional case summary that covers all the following points:

        1. FACTS: A summarized list of core facts.
        2. CASE_TITLE: The title of the case.
        3. PETITIONER: Name of the petitioner.
        4. RESPONDENT: Name of the respondent/defender.
        5. CASE_CATEGORY: Categorize as civil, criminal, family, constitutional, commercial, labor, or taxation.
        6. JUDGES: Names of the judges/bench.
        7. DATES: List important dates along with what happened on each date.
        8. PLAINTIFF_CLAIMS: What the petitioner is arguing.
        9. DEFENDANT_POSITION: The respondent's counter-arguments.
        10. RELIEF_SOUGHT: What the petitioner wants from the court.
        11. CHRONOLOGICAL_TIMELINE: A list of events in order with date, event, and status.
        12. LAW_REFERENCES: List of Acts or Sections mentioned.
        13. CASE_SUMMARY: A professional overview so a judge can quickly understand the case.
        14. PRIORITY: Indicate HIGH, MEDIUM, or ROUTINE and a brief reason why.

        IMPORTANT FORMATTING RULES:
        - Do NOT use markdown.
        - Do NOT use **, ##, ###, bullet symbols, or special formatting.
        - Use plain text only.
        - Use numbered headings exactly as shown above.
        - Each section should be separated by a new line.
        - The output must be directly readable as normal text.

        Format it as a readable, well-structured text summary with headings for each point.
        Avoid JSON or code blocks — it should be directly readable text.
        Document content:

        ${content}
              `,
              config: {
                temperature: 0.3
              }
            });

            return response.text || "Summary unavailable.";

          } catch (error) {
            console.error("Gemini Error:", error);
            return "Error generating AI summary.";
          }
        };

export const summarizeJudgmentPdf = async (fileUrl: string) => {

  try {

    const res = await fetch(fileUrl);
    const blob = await res.blob();
    const buffer = await blob.arrayBuffer();
    /* safe base64 conversion */
    let binary = "";
    const bytes = new Uint8Array(buffer);
    const chunkSize = 8192;
    for (
      let i = 0;
      i < bytes.length;
      i += chunkSize
    ) {
      const chunk =
        bytes.subarray(
          i,
          i + chunkSize
        );
      binary +=
        String.fromCharCode(...chunk);
    }
    const base64 = btoa(binary);
    const response = await getAI().models.generateContent({
        model:"gemini-2.5-flash-lite",
        contents:[
          {
            role:"user",
            parts:[
              {
                inlineData:{
                  mimeType:"application/pdf",
                  data:base64
                }
              },
              {
                text:
                ` You are a senior judicial assistant. Read the attached PDF judgment and generate a clear, 
                  professional case summary that covers all the following points:

                  1. FACTS: A summarized list of core facts.
                  2. CASE_TITLE: The title of the case.
                  3. PETITIONER: Name of the petitioner.
                  4. RESPONDENT: Name of the respondent/defender.
                  5. CASE_CATEGORY: Categorize as civil, criminal, family, constitutional, commercial, labor, or taxation.
                  6. JUDGES: Names of the judges/bench.
                  7. DATES: List important dates along with what happened on each date.
                  8. PLAINTIFF_CLAIMS: What the petitioner is arguing.
                  9. DEFENDANT_POSITION: The respondent's counter-arguments.
                  10. RELIEF_SOUGHT: What the petitioner wants from the court.
                  11. CHRONOLOGICAL_TIMELINE: A list of events in order with date, event, and status.
                  12. LAW_REFERENCES: List of Acts or Sections mentioned.
                  13. CASE_SUMMARY: A professional overview so a judge can quickly understand the case.
                  14. PRIORITY: Indicate HIGH, MEDIUM, or ROUTINE and a brief reason why.

                  IMPORTANT FORMATTING RULES:
                  - Do NOT use markdown.
                  - Do NOT use **, ##, ###, bullet symbols, or special formatting.
                  - Use plain text only.
                  - Use numbered headings exactly as shown above.
                  - Each section should be separated by a new line.
                  - The output must be directly readable as normal text.`
              }
            ]
          }
        ],
        config:{
          temperature:0.2
        }
      });
    return response.text || "Summary unavailable";
  }
  catch(err){
    console.log(err);
    return "Error reading judgment";
  }
};

export const generateCaseOverview = async (caseDetails: string) => {
  try {
    const response = await getAI().models.generateContent({
      model: 'gemini-2.5-flash-lite',
      contents: `Generate a brief legal overview for the following case details: ${caseDetails}. 
      Include possible precedents if applicable. Provide the response in clear bullet points.`,
      config: {
        temperature: 0.2,
      }
    });
    // Use .text property directly, do not call as a method.
    return response.text || "Overview unavailable.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error generating case overview.";
  }
};

export const summarizeCase = async (legalCase: SimilarLegalCase): Promise<string> => {
  const ai = getAI();
  const prompt = `You are a senior Indian Legal Researcher. Provide a professional and highly accessible legal brief for the following Indian case.
  
  IMPORTANT: 
  - Use PLAIN TEXT ONLY. 
  - NO markdown (no asterisks, no hashes, no bolding).
  - Use simple CAPITALIZED headings. 
  - Use clear spacing between sections.
  
  CASE DATA:
  Title: ${legalCase.title}
  Court: ${legalCase.court}
  Category: ${legalCase.category}
  Status: ${legalCase.status}
  Date Filed: ${legalCase.dateFiled}
  Judgment Summary: ${legalCase.judgment}
  Summary: ${legalCase.summary}
  Timeline Events: ${JSON.stringify(legalCase.timeline)}
  Precedents: ${JSON.stringify(legalCase.precedents)}
  
  Structure your response EXACTLY as follows:
  
  LEGAL ANALYSIS (LAYMAN'S TERMS)
  Explain the core legal dispute, the specific sections of Indian law involved (e.g., IPC, BNS, CPC), and the main arguments in simple, everyday language. Avoid complex legal jargon so a person without a law degree can understand it clearly.
  
  FINAL JUDGMENT EXPLAINED
  Summarize the final verdict in simple terms. Who won? What was the punishment or remedy? Why did the court decide this?
  
  TIMELINE REVIEW
  TOTAL CASE DURATION: [Calculate and state the total time elapsed from the filing date to the final judgment date in years, months, and days].
  
  PROCEEDINGS BREAKDOWN:
  For every event provided in the timeline data, list them exactly as follows:
  - [DATE]: [Detailed description of what actually happened in this hearing/event] | RESULT: [The specific outcome or temporary order passed during this session].
  
  POTENTIAL PRECEDENTS
  Briefly explain 1-2 landmark Indian cases that set a rule for this type of situation and how they apply here.
  
  ADVICE FOR RESEARCHERS
  What key keywords or specific law book chapters should be studied for this case type.
  
  ADVICE FOR USERS SEARCHING SIMILAR CASES
  Explain when this precedent is useful and what factual similarities matter most.
  Mention legal elements users should compare with their own situation.
  Provide search phrases users can use to find more similar judgments.
  Mention whether this precedent is strong, limited, or fact-specific.

  ADVICE FOR USERS WITH SIMILAR LEGAL ISSUES
  Provide general procedural guidance for users whose situation is similar:

  Include:
  - Typical legal options available in India for this dispute type (civil case, criminal complaint, consumer complaint, tribunal claim, arbitration, mediation, appeal).
  - Which court or authority usually handles such matters.
  - Types of documents generally required (agreements, FIR, notices, emails, invoices, identity proof, medical reports, financial records).
  - Common first steps before filing a case (legal notice, collecting evidence, consulting advocate).
  - Alternative dispute resolution options like settlement or mediation.
  - General timeline expectations in Indian legal system.
  - Note that outcomes depend on facts and professional legal advice may be needed.

  Keep this section general, educational, and practical.`;

  try {
    const response = await getAI().models.generateContent({
      model: 'gemini-2.5-flash-lite',
      contents: prompt,
    });
    return response.text || "Summary unavailable.";
  } catch (error) {
    console.error("Gemini summarization failed:", error);
    return "Error generating AI summary.";
  }
};

export const searchIntelligence = async (query: string, availableCases: SimilarLegalCase[]): Promise<string[]> => {
  const ai = getAI();
  const caseData = availableCases.map(c => ({ 
    id: c.id, 
    title: c.title, 
    summary: c.summary, 
    parties: c.parties,
    category: c.category,
    judgment: c.judgment
  }));
  
  const prompt = `You are an Indian legal research semantic search engine.
  The user is providing a query which might be VAGUE, CONCEPTUAL, or use non-legal terminology: "${query}"
  
  Your task: Analyze the intent behind the query and identify which of the following cases are contextually or legally similar, even if they don't share exact keywords.
  
  Available Cases: ${JSON.stringify(caseData)}
  
  Return ONLY a JSON array of case IDs that are relevant. If none are relevant, return an empty array [].`;

  try {
    const response = await getAI().models.generateContent({
      model: 'gemini-2.5-flash-lite',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });
    return JSON.parse(response.text || '[]');
  } catch (error) {
    console.error("Gemini search failed:", error);
    return [];
  }
};

export const generateMoreCases = async (category: CaseCategory): Promise<SimilarLegalCase[]> => {
    const ai = getAI();
    const prompt = `Generate 3 realistic mock legal cases for the category: ${category}, strictly within the context of the INDIAN LEGAL SYSTEM.
    IMPORTANT: ALL cases MUST have a status of "Closed".
    Use Indian names for parties and real Indian courts.
    Each case MUST include a "judgment" field summarizing the final verdict.
    Each case MUST include a detailed timeline of events (at least 4 entries starting from filing and ending with "Final Judgment").
    
    Return them as a JSON array matching this structure:
    [{
      "id": "string",
      "title": "string",
      "caseNumber": "string",
      "category": "${category}",
      "dateFiled": "YYYY-MM-DD",
      "status": "Closed",
      "court": "string",
      "parties": ["string"],
      "summary": "string",
      "judgment": "string",
      "timeline": [{"date": "YYYY-MM-DD", "topic": "string", "details": "string"}],
      "precedents": [{"caseName": "string", "relevance": "string"}]
    }]`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-lite',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            id: { type: Type.STRING },
                            title: { type: Type.STRING },
                            caseNumber: { type: Type.STRING },
                            category: { type: Type.STRING },
                            dateFiled: { type: Type.STRING },
                            status: { type: Type.STRING },
                            court: { type: Type.STRING },
                            parties: { type: Type.ARRAY, items: { type: Type.STRING } },
                            summary: { type: Type.STRING },
                            judgment: { type: Type.STRING },
                            timeline: {
                              type: Type.ARRAY,
                              items: {
                                type: Type.OBJECT,
                                properties: {
                                  date: { type: Type.STRING },
                                  topic: { type: Type.STRING },
                                  details: { type: Type.STRING }
                                },
                                required: ["date", "topic"]
                              }
                            },
                            precedents: {
                              type: Type.ARRAY,
                              items: {
                                type: Type.OBJECT,
                                properties: {
                                  caseName: { type: Type.STRING },
                                  relevance: { type: Type.STRING }
                                },
                                required: ["caseName", "relevance"]
                              }
                            }
                        },
                        required: ["id", "title", "caseNumber", "category", "dateFiled", "status", "court", "parties", "summary", "judgment", "timeline", "precedents"]
                    }
                }
            }
        });
        return JSON.parse(response.text || '[]');
    } catch (error) {
        console.error("Gemini generation failed:", error);
        return [];
    }
}
