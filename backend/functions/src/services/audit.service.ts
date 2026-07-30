import { db } from '../utils/firebase';
import { AuditAction } from '../domain/enums';
import { AuditLog } from '../domain/entities';

export class AuditService {
  static async logAction(ownerId: string, action: AuditAction | string, details: string, entityId?: string): Promise<void> {
    try {
      const logData: AuditLog = {
        ownerId,
        action,
        details,
        entityId,
        timestamp: Date.now(),
      };
      await db.collection('audit_logs').add(logData);
    } catch (error) {
      console.error('Failed to log audit action:', error);
    }
  }
}
