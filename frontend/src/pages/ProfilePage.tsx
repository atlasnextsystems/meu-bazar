import React, { useState } from 'react';
import { User, Save, Upload } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { ToastContainer } from '../components/ui/Toast';
import type { ToastMessage } from '../components/ui/Toast';

export const ProfilePage: React.FC = () => {
  const { user, userProfile, refreshProfile } = useAuth();

  const [firstName, setFirstName] = useState(userProfile?.firstName || '');
  const [lastName, setLastName] = useState(userProfile?.lastName || '');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState(userProfile?.photoUrl || '');
  const [saving, setSaving] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', title: string, description?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, description }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);

    try {
      let photoUrl = photoPreview;
      if (photoFile) {
        photoUrl = await apiService.uploadImage(photoFile, user.uid, 'avatars');
      }

      await apiService.updateProfile({
        firstName,
        lastName,
        photoUrl,
        email: user.email || '',
      });

      await refreshProfile();
      addToast('success', 'Perfil Atualizado!', 'Seus dados pessoais foram salvos com sucesso.');
    } catch (err: any) {
      addToast('error', 'Erro ao Atualizar Perfil', err.message || 'Ocorreu um erro.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          Minha Conta Pessoal <User className="w-5 h-5 text-emerald-600" />
        </h1>
        <p className="text-sm text-slate-500">
          Gerencie suas informações de conta e foto de perfil.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="glass-card p-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 pb-6 border-b border-slate-100">
          <div className="relative w-24 h-24 rounded-full bg-slate-100 border-2 border-slate-200 overflow-hidden flex items-center justify-center group">
            {photoPreview ? (
              <img src={photoPreview} alt="Perfil" className="w-full h-full object-cover" />
            ) : (
              <User className="w-10 h-10 text-slate-400" />
            )}
            <label className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white cursor-pointer transition">
              <Upload className="w-6 h-6" />
              <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
            </label>
          </div>

          <div className="text-center sm:text-left space-y-1">
            <h3 className="font-bold text-slate-900 text-lg">
              {firstName} {lastName}
            </h3>
            <p className="text-xs text-slate-500 font-medium">{user?.email}</p>
            <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Conta Pessoal Ativa
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Nome *
            </label>
            <input
              type="text"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Sobrenome *
            </label>
            <input
              type="text"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-emerald-600"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              E-mail da Conta (Não alterável)
            </label>
            <input
              type="email"
              disabled
              value={user?.email || ''}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 text-sm cursor-not-allowed"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-100">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition flex items-center space-x-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Salvando...' : 'Salvar Alterações'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
