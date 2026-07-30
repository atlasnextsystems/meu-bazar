import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, PlusCircle, ArrowRight, User, ShieldCheck, Sparkles, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const HomePage: React.FC = () => {
  const { user, userProfile, userBazaars, switchBazaar, logout } = useAuth();
  const navigate = useNavigate();

  const handleSelectBazaar = (bazaarId: string) => {
    switchBazaar(bazaarId);
    navigate('/dashboard');
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 px-6 py-4 flex items-center justify-between shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-md font-extrabold text-lg">
            MB
          </div>
          <div>
            <h1 className="font-extrabold text-slate-900 text-lg tracking-tight">Meu Bazar SaaS</h1>
            <p className="text-xs text-slate-500 font-medium">Painel Inicial de Seleção de Loja</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/profile')}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition"
          >
            <User className="w-4 h-4 text-emerald-600" />
            <span>{userProfile?.displayName || user?.email}</span>
          </button>

          <button
            onClick={handleLogout}
            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
            title="Sair da Conta"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6 sm:p-10 space-y-8">
        {/* Welcome Banner */}
        <div className="glass-card p-8 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-3xl shadow-lg relative overflow-hidden">
          <div className="relative z-10 space-y-2 max-w-2xl">
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase bg-emerald-500/40 text-emerald-100 border border-emerald-400/30">
              Bem-vindo(a) ao Meu Bazar
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight">
              Olá, {userProfile?.firstName || 'Usuário'}!
            </h2>
            <p className="text-emerald-100 text-sm">
              Selecione um dos seus bazares para gerenciar as vendas e caixa, ou crie uma nova loja agora mesmo.
            </p>
          </div>
          <Sparkles className="absolute right-6 top-6 w-32 h-32 text-emerald-400/20 pointer-events-none" />
        </div>

        {/* Bazaars Grid & Action Cards */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              Seus Bazares Cadastrados <Store className="w-5 h-5 text-emerald-600" />
            </h3>
            <button
              onClick={() => navigate('/create-bazar')}
              className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/30 transition flex items-center space-x-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Criar Novo Bazar</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Create New Bazaar Card */}
            <div
              onClick={() => navigate('/create-bazar')}
              className="glass-card p-6 rounded-3xl border-2 border-dashed border-emerald-300 bg-emerald-50/40 hover:bg-emerald-50 hover:border-emerald-500 transition cursor-pointer flex flex-col justify-between space-y-6 group"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition">
                  <PlusCircle className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-lg group-hover:text-emerald-700 transition">
                    Criar Novo Bazar
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Cadastre mais uma loja, defina o nicho e assine o plano SaaS via PagSeguro.
                  </p>
                </div>
              </div>

              <div className="flex items-center text-xs font-extrabold text-emerald-700 space-x-1">
                <span>Criar Novo Bazar</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </div>
            </div>

            {/* User Bazaars List Cards */}
            {userBazaars.map((b) => (
              <div
                key={b.id}
                onClick={() => handleSelectBazaar(b.id)}
                className="glass-card p-6 rounded-3xl border border-slate-200 bg-white hover:shadow-xl hover:border-emerald-300 transition cursor-pointer flex flex-col justify-between space-y-6 group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden">
                      {b.logoUrl ? (
                        <img src={b.logoUrl} alt={b.name} className="w-full h-full object-cover" />
                      ) : (
                        <Store className="w-7 h-7 text-emerald-600" />
                      )}
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      SaaS Ativo
                    </span>
                  </div>

                  <div>
                    <h4 className="font-extrabold text-slate-900 text-lg truncate group-hover:text-emerald-700 transition">
                      {b.name}
                    </h4>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">{b.niche}</p>
                    {b.cnpj && (
                      <p className="text-[10px] text-slate-400 font-mono mt-1">CNPJ: {b.cnpj}</p>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Dono / Membro
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectBazaar(b.id);
                    }}
                    className="py-2 px-4 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white font-bold text-xs transition flex items-center space-x-1"
                  >
                    <span>Entrar no Bazar</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {userBazaars.length === 0 && (
            <div className="p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-3">
              <Store className="w-12 h-12 text-slate-300 mx-auto" />
              <h4 className="font-bold text-slate-800 text-lg">Você ainda não possui nenhum bazar</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Clique no botão acima para criar o seu primeiro bazar e assinar o plano SaaS.
              </p>
              <button
                onClick={() => navigate('/create-bazar')}
                className="py-3 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition inline-flex items-center space-x-2"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Criar Meu Primeiro Bazar</span>
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
