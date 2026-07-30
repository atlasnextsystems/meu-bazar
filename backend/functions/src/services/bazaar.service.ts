import * as admin from 'firebase-admin';
import { db } from '../utils/firebase';
import { Bazaar, BazaarMember } from '../domain/entities';
import { UserRole } from '../domain/enums';
import { PaymentProcessorFactory } from '../adapters/payment/payment.factory';

export interface CreateBazaarRequest {
  name: string;
  cnpj?: string;
  niche: string;
  logoUrl?: string;
  phone?: string;
  address?: string;
}

export class BazaarService {
  static async createBazaar(ownerId: string, userEmail: string, request: CreateBazaarRequest): Promise<Bazaar> {
    if (!request.name || request.name.trim() === '') {
      throw new Error('Nome do bazar é obrigatório.');
    }

    const bazaarId = `BZ_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    // Process SaaS Subscription Payment via PagSeguro Adapter (Mock or Prod)
    const paymentAdapter = PaymentProcessorFactory.getAdapter();
    const paymentResult = await paymentAdapter.processPayment({
      saleId: `SAAS_SUB_${bazaarId}`,
      amount: 49.9,
      paymentMethod: 'PagSeguro Online',
      customerEmail: userEmail,
    });

    if (!paymentResult.success) {
      throw new Error(`Falha no pagamento da assinatura do SaaS: ${paymentResult.message}`);
    }

    const now = Date.now();
    const bazaarData: Bazaar = {
      id: bazaarId,
      ownerId,
      name: request.name.trim(),
      cnpj: request.cnpj || '',
      niche: request.niche || 'Variedades & Outros',
      logoUrl: request.logoUrl || '',
      phone: request.phone || '',
      address: request.address || '',
      hasActiveSubscription: true,
      subscriptionPlan: 'Plano Mensal SaaS - R$ 49,90',
      createdAt: now,
      updatedAt: now,
    };

    const batch = db.batch();

    // 1. Create Bazaar Doc
    const bazaarRef = db.collection('bazaars').doc(bazaarId);
    batch.set(bazaarRef, bazaarData);

    // 2. Add Owner Member Record
    const memberId = `${bazaarId}_${ownerId}`;
    const memberRef = db.collection('bazaar_members').doc(memberId);
    const memberData: BazaarMember = {
      id: memberId,
      bazaarId,
      userId: ownerId,
      userEmail,
      role: UserRole.OWNER,
      invitedBy: ownerId,
      status: 'active',
      createdAt: now,
    };
    batch.set(memberRef, memberData);

    await batch.commit();

    return bazaarData;
  }

  static async getUserBazaars(userId: string, userEmail: string): Promise<Bazaar[]> {
    // Fetch members matching userId or userEmail
    const memberSnap = await db
      .collection('bazaar_members')
      .where('userEmail', '==', userEmail)
      .get();

    const bazaarIds: string[] = [];
    memberSnap.forEach((doc: admin.firestore.QueryDocumentSnapshot) => {
      const data = doc.data() as BazaarMember;
      if (data.bazaarId) bazaarIds.push(data.bazaarId);
    });

    // Also fetch owned bazaars
    const ownedSnap = await db.collection('bazaars').where('ownerId', '==', userId).get();
    ownedSnap.forEach((doc: admin.firestore.QueryDocumentSnapshot) => {
      if (!bazaarIds.includes(doc.id)) bazaarIds.push(doc.id);
    });

    if (bazaarIds.length === 0) return [];

    const bazaars: Bazaar[] = [];
    for (const bId of bazaarIds) {
      const bSnap = await db.collection('bazaars').doc(bId).get();
      if (bSnap.exists) {
        bazaars.push({ id: bSnap.id, ...bSnap.data() } as Bazaar);
      }
    }

    return bazaars.sort((a, b) => b.createdAt - a.createdAt);
  }

  static async inviteMember(
    requesterId: string,
    bazaarId: string,
    targetEmail: string,
    role: UserRole
  ): Promise<BazaarMember> {
    // Check if requester is OWNER
    const memberId = `${bazaarId}_${requesterId}`;
    const reqSnap = await db.collection('bazaar_members').doc(memberId).get();

    if (!reqSnap.exists || (reqSnap.data() as BazaarMember).role !== UserRole.OWNER) {
      throw new Error('Apenas o Dono do Bazar pode convidar novos membros.');
    }

    const cleanEmail = targetEmail.trim().toLowerCase();
    const newMemberId = `${bazaarId}_${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`;

    const now = Date.now();
    const memberData: BazaarMember = {
      id: newMemberId,
      bazaarId,
      userEmail: cleanEmail,
      role,
      invitedBy: requesterId,
      status: 'pending',
      createdAt: now,
    };

    await db.collection('bazaar_members').doc(newMemberId).set(memberData, { merge: true });
    return memberData;
  }

  static async removeMember(requesterId: string, bazaarId: string, targetMemberId: string): Promise<void> {
    const memberId = `${bazaarId}_${requesterId}`;
    const reqSnap = await db.collection('bazaar_members').doc(memberId).get();

    if (!reqSnap.exists || (reqSnap.data() as BazaarMember).role !== UserRole.OWNER) {
      throw new Error('Apenas o Dono do Bazar pode remover membros.');
    }

    await db.collection('bazaar_members').doc(targetMemberId).delete();
  }

  static async updateBazaar(requesterId: string, bazaarId: string, updates: Partial<Bazaar>): Promise<void> {
    const memberId = `${bazaarId}_${requesterId}`;
    const reqSnap = await db.collection('bazaar_members').doc(memberId).get();

    if (!reqSnap.exists || (reqSnap.data() as BazaarMember).role !== UserRole.OWNER) {
      throw new Error('Apenas o Dono do Bazar pode alterar as configurações da loja.');
    }

    const cleaned: Partial<Bazaar> = {
      ...updates,
      updatedAt: Date.now(),
    };
    delete cleaned.id;
    delete cleaned.ownerId;

    await db.collection('bazaars').doc(bazaarId).update(cleaned);
  }
}
