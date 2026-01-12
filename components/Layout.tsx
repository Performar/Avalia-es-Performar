
import React from 'react';
import { User } from '../types';
import { Store } from '../store';
import { APP_NAME } from '../constants';

interface LayoutProps {
  user: User;
  children: React.ReactNode;
  onLogout: () => void;
  currentPage: string;
  setCurrentPage: (page: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ user, children, onLogout, currentPage, setCurrentPage }) => {
  const isMaster = user.role === 'MASTER_ADMIN';
  const isManager = user.role === 'MANAGER';

  const menuItems = isMaster ? [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'knowledge', label: 'Base de Conhecimento', icon: '📚' },
    { id: 'companies', label: 'Empresas & Pessoal', icon: '🏢' },
    { id: 'evaluations', label: 'Avaliações', icon: '📝' },
    { id: 'reports', label: 'Relatórios Master', icon: '📈' },
  ] : isManager ? [
    { id: 'dashboard', label: 'Relatórios do Setor', icon: '📈' },
    { id: 'my_evaluations', label: 'Minhas Avaliações', icon: '🏠' },
    { id: 'history', label: 'Meu Histórico', icon: '🕒' },
  ] : [
    { id: 'dashboard', label: 'Minhas Avaliações', icon: '🏠' },
    { id: 'history', label: 'Histórico', icon: '🕒' },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 text-white flex-shrink-0 flex flex-col">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center font-bold text-white">E</div>
          <h1 className="text-xl font-bold tracking-tight">{APP_NAME}</h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                currentPage === item.id ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span>{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-sm font-bold uppercase">
              {user.name.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold truncate">{user.name}</p>
              <p className="text-xs text-slate-500 truncate">
                {user.role === 'MASTER_ADMIN' ? 'Master Admin' : user.role === 'MANAGER' ? 'Gestor' : 'Funcionário'}
              </p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <span>🚪</span>
            <span className="font-medium">Sair</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;
