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
  static validateCNPJ(cnpj: string): boolean {
    const digits = cnpj.replace(/\D/g, '');
    if (digits.length !== 14) return false;
    if (/^(\d)\1{13}$/.test(digits)) return false;

    const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

    let sum = 0;
    for (let i = 0; i < 12; i++) sum += parseInt(digits[i]) * weights1[i];
    let remainder = sum % 11;
    const digit1 = remainder < 2 ? 0 : 11 - remainder;
    if (parseInt(digits[12]) !== digit1) return false;

    sum = 0;
    for (let i = 0; i < 13; i++) sum += parseInt(digits[i]) * weights2[i];
    remainder = sum % 11;
    const digit2 = remainder < 2 ? 0 : 11 - remainder;
    return parseInt(digits[13]) === digit2;
  }

  static async createBazaar(ownerId: string, userEmail: string, request: CreateBazaarRequest): Promise<Bazaar> {
    if (!request.name || request.name.trim() === '') {
      throw new Error('Nome do bazar é obrigatório.');
    }

    if (request.cnpj && request.cnpj.trim() !== '' && !this.validateCNPJ(request.cnpj)) {
      throw new Error('CNPJ inválido. Verifique os dígitos.');
    }

    const bazaarId = `BZ_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

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

    const bazaarRef = db.collection('bazaars').doc(bazaarId);
    batch.set(bazaarRef, bazaarData);

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
    const memberSnap = await db
      .collection('bazaar_members')
      .where('userEmail', '==', userEmail)
      .get();

    const bazaarIds: string[] = [];
    memberSnap.forEach((doc: admin.firestore.QueryDocumentSnapshot) => {
      const data = doc.data() as BazaarMember;
      if (data.bazaarId) bazaarIds.push(data.bazaarId);
    });

    const ownedSnap = await db.collection('bazaars').where('ownerId', '==', userId).get();
    ownedSnap.forEach((doc: admin.firestore.QueryDocumentSnapshot) => {
      if (!bazaarIds.includes(doc.id)) bazaarIds.push(doc.id);
    });

    if (bazaarIds.length === 0) return [];

    // Batch fetch all bazaars at once (fixes N+1)
    const bazaarRefs = bazaarIds.map((id) => db.collection('bazaars').doc(id));
    const bazaarSnaps = await db.getAll(...bazaarRefs);

    const bazaars: Bazaar[] = [];
    bazaarSnaps.forEach((snap) => {
      if (snap.exists) {
        bazaars.push({ id: snap.id, ...snap.data() } as Bazaar);
      }
    });

    return bazaars.sort((a, b) => b.createdAt - a.createdAt);
  }

  static async inviteMember(
    requesterId: string,
    bazaarId: string,
    targetEmail: string,
    role: UserRole
  ): Promise<BazaarMember> {
    if (role !== UserRole.MANAGER && role !== UserRole.CASHIER) {
      throw new Error('Cargo inválido. Apenas Gerente e Caixa podem ser convidados.');
    }

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

    const targetSnap = await db.collection('bazaar_members').doc(targetMemberId).get();
    if (targetSnap.exists && (targetSnap.data() as BazaarMember).role === UserRole.OWNER) {
      throw new Error('O Dono do Bazar não pode ser removido.');
    }

    await db.collection('bazaar_members').doc(targetMemberId).delete();
  }

  static async updateBazaar(requesterId: string, bazaarId: string, updates: Partial<Bazaar>): Promise<void> {
    const memberId = `${bazaarId}_${requesterId}`;
    const reqSnap = await db.collection('bazaar_members').doc(memberId).get();

    if (!reqSnap.exists || (reqSnap.data() as BazaarMember).role !== UserRole.OWNER) {
      throw new Error('Apenas o Dono do Bazar pode alterar as configurações da loja.');
    }

    if (updates.cnpj && updates.cnpj.trim() !== '' && !this.validateCNPJ(updates.cnpj)) {
      throw new Error('CNPJ inválido. Verifique os dígitos.');
    }

    const cleaned: Partial<Bazaar> = {
      ...updates,
      updatedAt: Date.now(),
    };
    delete cleaned.id;
    delete cleaned.ownerId;
    delete cleaned.hasActiveSubscription;
    delete cleaned.subscriptionPlan;
    delete cleaned.createdAt;

    await db.collection('bazaars').doc(bazaarId).update(cleaned);
  }
}
