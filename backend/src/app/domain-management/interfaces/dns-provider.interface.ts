import { DnsProviderType } from '@prisma/client';

export interface IDnsProviderStrategy {
  type: DnsProviderType;

  // Domain verification
  getTxtRecord(settings: Record<string, any>, name: string): Promise<string[]>;

  // DNS record management (simplified for now)
  addTxtRecord(settings: Record<string, any>, name: string, value: string): Promise<void>;
  deleteTxtRecord(settings: Record<string, any>, name: string, value: string): Promise<void>;

  // Check existing records
  checkMxRecords(settings: Record<string, any>, domainName: string): Promise<boolean>;
  checkSpfRecord(settings: Record<string, any>, domainName: string): Promise<boolean>;
  checkDkimRecord(settings: Record<string, any>, domainName: string): Promise<boolean>; // Might need selector
  checkDmarcRecord(settings: Record<string, any>, domainName: string): Promise<boolean>;

  // Update records (more complex, might involve specific record IDs)
  updateMxRecords(settings: Record<string, any>, domainName: string, records: { exchange: string; priority: number }[]): Promise<void>;
  updateSpfRecord(settings: Record<string, any>, domainName: string, record: string): Promise<void>;
  updateDkimRecord(settings: Record<string, any>, domainName: string, selector: string, publicKey: string): Promise<void>;
  updateDmarcRecord(settings: Record<string, any>, domainName: string, record: string): Promise<void>;
}
