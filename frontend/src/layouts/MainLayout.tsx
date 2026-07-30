import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingCart,
  History,
  BarChart3,
  Settings as SettingsIcon,
  LogOut,
  Store,
  Menu,
  X,
  ChevronDown,
  PlusCircle,
  User,
  Shield,
  Home,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const MainLayout: React.FC = () => {
  const { user, userProfile, activeBazaar, userBazaars, activeRole, switchBazaar, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [bazaarDropdownOpen, setBazaarDropdownOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', roles: ['OWNER', 'MANAGER', 'CASHIER'] },
    { label: 'Registrar Venda (PDV)', icon: ShoppingCart, path: '/pos', roles: ['OWNER', 'MANAGER', 'CASHIER'] },
    { label: 'Histórico de Vendas', icon: History, path: '/history', roles: ['OWNER', 'MANAGER', 'CASHIER'] },
    { label: 'Relatórios & CSV', icon: BarChart3, path: '/reports', roles: ['OWNER', 'MANAGER'] },
    { label: 'Configurações do Bazar', icon: SettingsIcon, path: '/settings', roles: ['OWNER', 'MANAGER'] },
    { label: 'Perfil Pessoal', icon: User, path: '/profile', roles: ['OWNER', 'MANAGER', 'CASHIER'] },
  ];

  const visibleNavItems = navItems.filter((item) => item.roles.includes(activeRole));

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-slate-200 bg-white sticky top-0 h-screen p-4 justify-between z-30 shadow-xs">
        <div>
          {/* Home Link & Store Switcher */}
          <div className="space-y-2 mb-6">
            <button
              onClick={() => navigate('/home')}
              className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-100 font-bold text-xs transition border border-slate-200"
            >
              <Home className="w-4 h-4 text-emerald-600" />
              <span>Início (Meus Bazares)</span>
            </button>

            <div className="relative">
              <button
                onClick={() => setBazaarDropdownOpen(!bazaarDropdownOpen)}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition"
              >
                <div className="flex items-center space-x-3 overflow-hidden">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                    {activeBazaar?.logoUrl ? (
                      <img src={activeBazaar.logoUrl} alt="Logo" className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      <Store className="w-5 h-5" />
                    )}
                  </div>
                  <div className="overflow-hidden">
                    <h1 className="font-bold text-slate-900 text-sm truncate">
                      {activeBazaar?.name || 'Meu Bazar'}
                    </h1>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 inline-block">
                      {activeRole}
                    </span>
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
              </button>

              {/* Bazaar Switcher Dropdown */}
              {bazaarDropdownOpen && (
                <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 space-y-1 z-50">
                  <div className="text-[10px] font-bold text-slate-400 uppercase px-2 py-1">Meus Bazares</div>
                  {userBazaars.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => {
                        switchBazaar(b.id);
                        setBazaarDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition flex items-center justify-between ${
                        b.id === activeBazaar?.id
                          ? 'bg-emerald-50 text-emerald-800'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span className="truncate">{b.name}</span>
                      {b.id === activeBazaar?.id && <span className="w-2 h-2 rounded-full bg-emerald-600" />}
                    </button>
                  ))}

                  <div className="pt-1 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setBazaarDropdownOpen(false);
                        navigate('/create-bazar');
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-emerald-700 hover:bg-emerald-50 transition flex items-center space-x-2"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>+ Criar Novo Bazar</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30 font-bold'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`
                  }
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User Footer & Logout */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <NavLink
            to="/profile"
            className="flex items-center space-x-3 p-2 rounded-xl hover:bg-slate-50 transition"
          >
            <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-bold overflow-hidden border border-slate-300">
              {userProfile?.photoUrl ? (
                <img src={userProfile.photoUrl} alt="User" className="w-full h-full object-cover" />
              ) : (
                <User className="w-5 h-5 text-slate-500" />
              )}
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-bold text-slate-900 truncate">
                {userProfile?.displayName || user?.email}
              </div>
              <div className="text-[10px] text-slate-400 truncate">{user?.email}</div>
            </div>
          </NavLink>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-xl bg-rose-50 text-rose-600 font-semibold text-xs hover:bg-rose-100 transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Sair da Conta</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 border-b border-slate-200 bg-white sticky top-0 z-20 px-4 sm:px-6 flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <button
              onClick={() => navigate('/home')}
              className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
            >
              <Home className="w-4 h-4 text-emerald-600" />
              <span>Início</span>
            </button>

            <h2 className="text-lg font-bold text-slate-900 hidden sm:block truncate">
              {activeBazaar?.name || 'Meu Bazar'}
            </h2>
          </div>

          <div className="flex items-center space-x-3">
            <span className="hidden sm:inline-block text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
              <Shield className="w-3.5 h-3.5 inline mr-1 text-emerald-600" /> {activeRole}
            </span>

            <NavLink
              to="/profile"
              className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-800 text-xs font-semibold hover:bg-slate-200 transition"
            >
              <User className="w-4 h-4 text-emerald-600" />
              <span className="truncate max-w-[120px]">{userProfile?.firstName || 'Perfil'}</span>
            </NavLink>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-40 flex">
            <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
            <div className="relative w-64 bg-white h-full p-4 flex flex-col justify-between z-50">
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                  <div className="flex items-center space-x-2">
                    <Store className="w-6 h-6 text-emerald-600" />
                    <h1 className="font-bold text-slate-900 truncate">
                      {activeBazaar?.name || 'Meu Bazar'}
                    </h1>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate('/home');
                  }}
                  className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl bg-slate-100 text-slate-800 font-bold text-xs mb-3"
                >
                  <Home className="w-4 h-4 text-emerald-600" />
                  <span>Voltar para Início (Meus Bazares)</span>
                </button>

                <nav className="space-y-1">
                  {visibleNavItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center space-x-3 px-3 py-2.5 rounded-xl font-medium text-sm transition ${
                            isActive ? 'bg-emerald-600 text-white font-bold' : 'text-slate-600 hover:bg-slate-100'
                          }`
                        }
                      >
                        <Icon className="w-5 h-5" />
                        <span>{item.label}</span>
                      </NavLink>
                    );
                  })}
                </nav>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-xl bg-rose-50 text-rose-600 font-semibold text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sair da Conta</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Page Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
