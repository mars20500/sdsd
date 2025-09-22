
import { GoogleGenAI, Type } from "@google/genai";
import { GEMINI_MODEL } from '../constants';
import type { SPFResult } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      domain: {
        type: Type.STRING,
        description: 'The domain name that was looked up.',
      },
      record: {
        type: Type.STRING,
        description: 'The full SPF TXT record. If not found, it must state "No SPF record found.". If the lookup fails, it must state "DNS lookup failed for this domain.".',
      },
    },
    required: ['domain', 'record'],
  },
};

export const lookupSpfRecords = async (domains: string[]): Promise<Omit<SPFResult, 'status'>[]> => {
  if (domains.length === 0) {
    return [];
  }

  const prompt = `For the following list of domains, please find and return their DNS SPF (Sender Policy Framework) TXT records.
- You **must** return an entry for every single domain provided in the input list. Do not omit any domain from the output.
- To ensure accuracy, please perform the DNS lookups using a reliable public DNS resolver like Google Public DNS (8.8.8.8) or Cloudflare (1.1.1.1).
- For valid domains without an SPF record, the 'record' value must be the string "No SPF record found.".
- If a domain is invalid or a DNS lookup completely fails, the 'record' value must be "DNS lookup failed for this domain.".
- Ensure the output is a valid JSON array matching the provided schema.
Domains: ${domains.join(', ')}`;
  
  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const jsonString = response.text.trim();
    const parsedResult = JSON.parse(jsonString);

    if (Array.isArray(parsedResult)) {
        return parsedResult as Omit<SPFResult, 'status'>[];
    }
    return [];

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to fetch SPF records from the AI service.");
  }
};
