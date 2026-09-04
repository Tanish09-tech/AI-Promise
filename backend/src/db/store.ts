import fs from 'fs';
import path from 'path';
import { Invoice, Commitment, Payment, ExceptionCase, AuditLog, PolicyConfig } from '../types/commit';
import { initialInvoices, initialCommitments, initialPayments, initialExceptions, initialAuditLogs } from '../data/mockData';
import { defaultPolicyConfig } from '../config/defaultPolicy';

interface StoreData {
  currentDate: string;
  invoices: Invoice[];
  commitments: Commitment[];
  payments: Payment[];
  exceptions: ExceptionCase[];
  auditLogs: AuditLog[];
  policyConfig: PolicyConfig;
  processedWebhookEventIds: string[];
}

const DATA_FILE = path.join(__dirname, '../../data/store.json');

export class DataStore {
  private data: StoreData;

  constructor() {
    this.data = this.loadStore();
    if (!this.data.processedWebhookEventIds) {
      this.data.processedWebhookEventIds = [];
    }
  }

  private loadStore(): StoreData {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const fileContent = fs.readFileSync(DATA_FILE, 'utf-8');
        const parsed = JSON.parse(fileContent);
        if (!parsed.processedWebhookEventIds) {
          parsed.processedWebhookEventIds = [];
        }
        return parsed;
      }
    } catch (e) {
      console.warn('Failed to read store file, reinitializing default data:', e);
    }
    return this.getInitialState();
  }

  public saveStore(): void {
    try {
      const dir = path.dirname(DATA_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to persist store:', e);
    }
  }

  private getInitialState(): StoreData {
    return {
      currentDate: '2026-09-07',
      invoices: [...initialInvoices],
      commitments: [...initialCommitments],
      payments: [...initialPayments],
      exceptions: [...initialExceptions],
      auditLogs: [...initialAuditLogs],
      policyConfig: { ...defaultPolicyConfig },
      processedWebhookEventIds: []
    };
  }

  public resetToDefaults(): void {
    this.data = this.getInitialState();
    this.saveStore();
  }

  // Getters
  public getCurrentDate(): string {
    return this.data.currentDate;
  }

  public getInvoices(): Invoice[] {
    return this.data.invoices;
  }

  public getCommitments(): Commitment[] {
    return this.data.commitments;
  }

  public getPayments(): Payment[] {
    return this.data.payments;
  }

  public getExceptions(): ExceptionCase[] {
    return this.data.exceptions;
  }

  public getAuditLogs(): AuditLog[] {
    return this.data.auditLogs;
  }

  public getPolicyConfig(): PolicyConfig {
    return this.data.policyConfig;
  }

  // Mutators
  public setCurrentDate(date: string): void {
    this.data.currentDate = date;
    this.saveStore();
  }

  public updatePolicyConfig(config: Partial<PolicyConfig>): void {
    this.data.policyConfig = { ...this.data.policyConfig, ...config };
    this.saveStore();
  }

  public isWebhookProcessed(eventId: string): boolean {
    if (!eventId) return false;
    return this.data.processedWebhookEventIds.includes(eventId);
  }

  public markWebhookProcessed(eventId: string): void {
    if (eventId && !this.data.processedWebhookEventIds.includes(eventId)) {
      this.data.processedWebhookEventIds.push(eventId);
      this.saveStore();
    }
  }

  public getInvoiceByRazorpayOrderId(orderId: string): Invoice | undefined {
    if (!orderId) return undefined;
    return this.data.invoices.find(i => i.razorpay_order_id === orderId);
  }

  public addAuditLog(
    entity_type: AuditLog['entity_type'],
    entity_id: string,
    event_type: string,
    previous_state?: string,
    new_state?: string,
    decision?: string,
    reason?: string
  ): AuditLog {
    const log: AuditLog = {
      id: `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      entity_type,
      entity_id,
      event_type,
      previous_state,
      new_state,
      decision,
      reason,
      policy_version: 'v1.2.0'
    };
    this.data.auditLogs.unshift(log);
    this.saveStore();
    return log;
  }
}

export const db = new DataStore();
