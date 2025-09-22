
export type SPFStatus = 'Pending' | 'Found' | 'Not Found' | 'Error';

export interface SPFResult {
  domain: string;
  record: string;
  status: SPFStatus;
}
