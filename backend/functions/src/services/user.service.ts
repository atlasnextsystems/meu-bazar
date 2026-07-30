import { db } from '../utils/firebase';
import { UserProfile } from '../domain/entities';

export class UserService {
  static async updateSettings(ownerId: string, profileData: Partial<UserProfile>): Promise<UserProfile> {
    const docRef = db.collection('users').doc(ownerId);
    const snap = await docRef.get();

    const now = Date.now();
    const existing = snap.exists ? (snap.data() as UserProfile) : ({} as UserProfile);

    const updatedProfile: UserProfile = {
      uid: ownerId,
      email: profileData.email || existing.email || '',
      firstName: profileData.firstName || existing.firstName || '',
      lastName: profileData.lastName || existing.lastName || '',
      displayName: `${profileData.firstName || existing.firstName || ''} ${profileData.lastName || existing.lastName || ''}`.trim(),
      photoUrl: profileData.photoUrl || existing.photoUrl || '',
      createdAt: existing.createdAt || now,
      updatedAt: now,
    };

    await docRef.set(updatedProfile, { merge: true });
    return updatedProfile;
  }
}
