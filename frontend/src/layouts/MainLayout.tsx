import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  History,
  BarChart3,
  Settings as SettingsIcon,
  LogOut,
  Store,
  Menu,
  X,
  CreditCard,
  User as UserIcon,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const MainLayout: React.FC = () => {
  const { user, userProfile, logout, settings } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const envMode = import.meta.env.VITE_ENV_MODE || 'dev';

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Estoque / Produtos', icon: Package, path: '/products' },
    { label: 'Registrar Venda (PDV)', icon: ShoppingCart, path: '/pos' },
    { label: 'Histórico de Vendas', icon: History, path: '/history' },
    { label: 'Relatórios & CSV', icon: BarChart3, path: '/reports' },
    { label: 'Configurações', icon: SettingsIcon, path: '/settings' },
  ];

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-slate-200 bg-white sticky top-0 h-screen p-4 justify-between z-30 shadow-sm">
        <div>
          {/* Logo & Store Name */}
          <div className="flex items-center space-x-3 px-3 py-4 border-b border-slate-100 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md font-bold">
              {settings?.logoUrl ? (
                <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-cover rounded-xl" />
              ) : (
                <Store className="w-5 h-5" />
              )}
            </div>
            <div className="overflow-hidden">
              <h1 className="font-bold text-slate-900 truncate">
                {settings?.bazarName || 'Meu Bazar'}
              </h1>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full inline-block">
                SaaS Ativo
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
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

        {/* Footer info & Logout */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-100 text-xs">
            <span className="text-slate-500 flex items-center gap-1">
              <CreditCard className="w-3.5 h-3.5 text-slate-400" /> PagSeguro
            </span>
            <span
              className={`px-2 py-0.5 rounded-full font-bold uppercase ${
                envMode === 'prod' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}
            >
              {envMode}
            </span>
          </div>

          <div className="flex items-center justify-between px-3">
            <div className="text-xs text-slate-600 truncate max-w-[120px]" title={user?.email || ''}>
              {userProfile?.displayName || user?.email}
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
              title="Sair da conta"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
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
            <h2 className="text-lg font-bold text-slate-900 hidden sm:block">
              {settings?.bazarName || 'Meu Bazar'}
            </h2>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold">
              <UserIcon className="w-4 h-4 text-emerald-600" />
              <span>{userProfile?.displayName || user?.email}</span>
            </div>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-40 flex">
            <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
            <div className="relative w-64 bg-white h-full p-4 flex flex-col justify-between z-50">
              <div>
                <div className="flex items-center space-x-3 px-3 py-4 border-b border-slate-100 mb-4">
                  <Store className="w-6 h-6 text-emerald-600" />
                  <h1 className="font-bold text-slate-900">
                    {settings?.bazarName || 'Meu Bazar'}
                  </h1>
                </div>

                <nav className="space-y-1">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center space-x-3 px-3 py-2.5 rounded-xl font-medium text-sm transition ${
                            isActive
                              ? 'bg-emerald-600 text-white font-bold'
                              : 'text-slate-600 hover:bg-slate-100'
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

        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
