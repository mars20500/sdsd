import type { SPFResult } from '../types';

const DOH_ENDPOINT = 'https://dns.google/resolve';

const isIPv4 = (input: string): boolean => {
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  return ipv4Regex.test(input);
};

const getPtrDomain = (ip: string): string => {
  return ip.split('.').reverse().join('.') + '.in-addr.arpa';
};

const findSpfRecord = (answers: { data: string }[]): string | null => {
  if (!answers) return null;
  for (const answer of answers) {
    const record = answer.data.replace(/"/g, '');
    if (record.startsWith('v=spf1')) {
      return record;
    }
  }
  return null;
};

const lookupTxtForDomain = async (domain: string): Promise<Omit<SPFResult, 'domain'>> => {
  try {
    const response = await fetch(`${DOH_ENDPOINT}?name=${encodeURIComponent(domain)}&type=TXT`);
    if (!response.ok) return { record: `HTTP error! Status: ${response.status}`, status: 'Error' };

    const data = await response.json();
    if (data.Status === 0 && data.Answer) {
      const spfRecord = findSpfRecord(data.Answer);
      if (spfRecord) return { record: spfRecord, status: 'Found' };
    }
    
    if (data.Status === 3) return { record: 'Domain does not exist (NXDOMAIN).', status: 'Error' };

    return { record: 'No SPF record found.', status: 'Not Found' };
  } catch (error) {
    console.error(`Failed to lookup TXT for ${domain}:`, error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { record: `Network or script error: ${message}`, status: 'Error' };
  }
};

const lookupPtrForIp = async (ip: string): Promise<{ domain: string | null; error?: string }> => {
  const ptrDomain = getPtrDomain(ip);
  try {
    const response = await fetch(`${DOH_ENDPOINT}?name=${encodeURIComponent(ptrDomain)}&type=PTR`);
    if (!response.ok) return { domain: null, error: `HTTP error! Status: ${response.status}` };

    const data = await response.json();
    if (data.Status === 0 && data.Answer && data.Answer.length > 0) {
      const resolvedDomain = data.Answer[0].data.replace(/\.$/, '');
      return { domain: resolvedDomain };
    }
    
    if (data.Status === 3) return { domain: null, error: 'No PTR record found (NXDOMAIN).' };
    return { domain: null, error: 'No PTR record found.' };
  } catch (error) {
    console.error(`Failed to lookup PTR for ${ip}:`, error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { domain: null, error: `Network error: ${message}` };
  }
};

export const lookupSpfForInput = async (input: string): Promise<SPFResult> => {
  if (!isIPv4(input)) {
    const result = await lookupTxtForDomain(input);
    return { domain: input, ...result };
  }

  const ptrResult = await lookupPtrForIp(input);
  if (ptrResult.domain) {
    const spfResult = await lookupTxtForDomain(ptrResult.domain);
    return {
      domain: `${input} → ${ptrResult.domain}`,
      record: spfResult.record,
      status: spfResult.status,
    };
  } else {
    return {
      domain: input,
      record: ptrResult.error || 'Failed to resolve IP to a domain.',
      status: 'Error',
    };
  }
};
