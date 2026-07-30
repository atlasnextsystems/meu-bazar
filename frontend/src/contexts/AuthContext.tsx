import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile as firebaseUpdateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import type { UserProfile, Bazaar, BazaarMember, UserRole } from '../types';
import { apiService } from '../services/api';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  userBazaars: Bazaar[];
  activeBazaar: Bazaar | null;
  activeRole: UserRole;
  switchBazaar: (bazaarId: string) => void;
  refreshBazaars: () => Promise<void>;
  login: (email: string, pass: string) => Promise<void>;
  signup: (email: string, pass: string, firstName: string, lastName: string, photoUrl?: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const [userBazaars, setUserBazaars] = useState<Bazaar[]>([]);
  const [activeBazaar, setActiveBazaar] = useState<Bazaar | null>(null);
  const [activeRole, setActiveRole] = useState<UserRole>('OWNER');

  const fetchUserDataAndBazaars = async (currentUser: User) => {
    try {
      // 1. Profile
      const userRef = doc(db, 'users', currentUser.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        setUserProfile(userSnap.data() as UserProfile);
      }

      // 2. Fetch Bazaars
      const bazaars = await apiService.getUserBazaars();
      setUserBazaars(bazaars);

      if (bazaars.length > 0) {
        // Persist active bazaar choice or default to first
        const savedBazaarId = localStorage.getItem('mbz_active_bazaar_id');
        const selected = bazaars.find((b) => b.id === savedBazaarId) || bazaars[0];
        setActiveBazaar(selected);
        await determineRole(currentUser, selected.id);
      } else {
        setActiveBazaar(null);
      }
    } catch (err) {
      console.error('Error loading user data and bazaars:', err);
    }
  };

  const determineRole = async (currentUser: User, bazaarId: string) => {
    try {
      const q = query(
        collection(db, 'bazaar_members'),
        where('bazaarId', '==', bazaarId),
        where('userEmail', '==', currentUser.email?.toLowerCase())
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        const memberData = snap.docs[0].data() as BazaarMember;
        setActiveRole(memberData.role || 'CASHIER');
      } else {
        setActiveRole('OWNER');
      }
    } catch (err) {
      console.error('Role determination error:', err);
      setActiveRole('OWNER');
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await fetchUserDataAndBazaars(currentUser);
      } else {
        setUserProfile(null);
        setUserBazaars([]);
        setActiveBazaar(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const switchBazaar = (bazaarId: string) => {
    const found = userBazaars.find((b) => b.id === bazaarId);
    if (found) {
      setActiveBazaar(found);
      localStorage.setItem('mbz_active_bazaar_id', found.id);
      if (user) determineRole(user, found.id);
    }
  };

  const refreshBazaars = async () => {
    if (user) {
      await fetchUserDataAndBazaars(user);
    }
  };

  const login = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const signup = async (email: string, pass: string, firstName: string, lastName: string, photoUrl: string = '') => {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    if (cred.user) {
      const displayName = `${firstName} ${lastName}`.trim();
      await firebaseUpdateProfile(cred.user, { displayName, photoURL: photoUrl });

      try {
        await sendEmailVerification(cred.user);
      } catch (e) {
        console.warn('Email verification send issue:', e);
      }

      const userProfileData: UserProfile = {
        uid: cred.user.uid,
        email: cred.user.email || email,
        firstName,
        lastName,
        displayName,
        photoUrl,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      await setDoc(doc(db, 'users', cred.user.uid), userProfileData);
      setUserProfile(userProfileData);
    }
  };

  const logout = async () => {
    localStorage.removeItem('mbz_active_bazaar_id');
    await firebaseSignOut(auth);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const refreshProfile = async () => {
    if (user) {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        setUserProfile(userSnap.data() as UserProfile);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        userBazaars,
        activeBazaar,
        activeRole,
        switchBazaar,
        refreshBazaars,
        login,
        signup,
        logout,
        resetPassword,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
