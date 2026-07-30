import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import type { Settings, UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  settings: Settings | null;
  login: (email: string, pass: string) => Promise<void>;
  signup: (email: string, pass: string, firstName: string, lastName: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshSettings: () => Promise<void>;
  createBazarWithSubscription: (bazarName: string, phone?: string, address?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<Settings | null>(null);

  const fetchUserData = async (uid: string) => {
    try {
      // Fetch Profile
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        setUserProfile(userSnap.data() as UserProfile);
      }

      // Fetch Settings / Bazaar Subscription
      const settingsRef = doc(db, 'settings', uid);
      const settingsSnap = await getDoc(settingsRef);
      if (settingsSnap.exists()) {
        setSettings(settingsSnap.data() as Settings);
      } else {
        setSettings(null);
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await fetchUserData(currentUser.uid);
      } else {
        setUserProfile(null);
        setSettings(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const signup = async (email: string, pass: string, firstName: string, lastName: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    if (cred.user) {
      const displayName = `${firstName} ${lastName}`.trim();
      await updateProfile(cred.user, { displayName });

      // Send email verification
      try {
        await sendEmailVerification(cred.user);
      } catch (e) {
        console.warn('Could not send verification email:', e);
      }

      // Create User Profile document in Firestore
      const userProfileData: UserProfile = {
        uid: cred.user.uid,
        email: cred.user.email || email,
        firstName,
        lastName,
        displayName,
        hasActiveSubscription: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      await setDoc(doc(db, 'users', cred.user.uid), userProfileData);
      setUserProfile(userProfileData);
    }
  };

  const createBazarWithSubscription = async (bazarName: string, phone: string = '', address: string = '') => {
    if (!user) throw new Error('Usuário não autenticado.');

    const now = Date.now();
    const newSettings: Settings = {
      ownerId: user.uid,
      bazarName: bazarName || 'Meu Bazar',
      phone,
      address,
      theme: 'light',
      hasActiveSubscription: true,
      subscriptionPlan: 'Plano Mensal SaaS - PagSeguro',
      updatedAt: now,
    };

    await setDoc(doc(db, 'settings', user.uid), newSettings, { merge: true });
    await setDoc(doc(db, 'users', user.uid), { hasActiveSubscription: true, updatedAt: now }, { merge: true });

    setSettings(newSettings);
    setUserProfile((prev) => (prev ? { ...prev, hasActiveSubscription: true } : null));
  };

  const logout = async () => {
    await firebaseSignOut(auth);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const refreshSettings = async () => {
    if (user) {
      await fetchUserData(user.uid);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        settings,
        login,
        signup,
        logout,
        resetPassword,
        refreshSettings,
        createBazarWithSubscription,
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
