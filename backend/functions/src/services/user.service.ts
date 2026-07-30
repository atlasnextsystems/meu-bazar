import { db } from '../utils/firebase';
import { Settings } from '../domain/entities';
import { AuditAction } from '../domain/enums';
import { AuditService } from './audit.service';

export class UserService {
  static async updateSettings(ownerId: string, settingsData: Partial<Settings>): Promise<Settings> {
    const docRef = db.collection('settings').doc(ownerId);

    const now = Date.now();
    const updatedSettings: Settings = {
      ownerId,
      bazarName: settingsData.bazarName || 'Meu Bazar',
      phone: settingsData.phone || '',
      address: settingsData.address || '',
      logoUrl: settingsData.logoUrl || '',
      theme: settingsData.theme || 'light',
      pagSeguroEmail: settingsData.pagSeguroEmail || '',
      pagSeguroToken: settingsData.pagSeguroToken || '',
      updatedAt: now,
    };

    await docRef.set(updatedSettings, { merge: true });
    await AuditService.logAction(ownerId, AuditAction.UPDATE_SETTINGS, 'Updated store settings');

    return updatedSettings;
  }

  static async getSettings(ownerId: string): Promise<Settings> {
    const docRef = db.collection('settings').doc(ownerId);
    const snap = await docRef.get();

    if (!snap.exists) {
      return {
        ownerId,
        bazarName: 'Meu Bazar',
        theme: 'light',
        updatedAt: Date.now(),
      };
    }

    return snap.data() as Settings;
  }
}
