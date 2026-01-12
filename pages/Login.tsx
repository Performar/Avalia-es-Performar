
import React, { useState } from 'react';
import { User } from '../types';
import { Store } from '../store';
import { MASTER_USER, INITIAL_PASSWORD_MASTER, APP_NAME } from '../constants';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanUsername = username.trim().toLowerCase();
    const cleanPassword = password.trim();

    // Regra flexível para o Master Admin (Aceita "marcosramos" ou "marcos ramos")
    const isMasterUsername = cleanUsername === MASTER_USER.username || cleanUsername === MASTER_USER.name.toLowerCase();
    const isMasterPassword = cleanPassword === INITIAL_PASSWORD_MASTER;

    if (isMasterUsername && isMasterPassword) {
      onLogin(MASTER_USER);
      return;
    }

    // Check other users
    const users = Store.getUsers();
    const user = users.find(u => 
      u.username.toLowerCase() === cleanUsername && 
      u.password === cleanPassword
    );
    
    if (user) {
      onLogin(user);
    } else {
      setError('Usuário ou senha inválidos. Verifique os dados e tente novamente.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden">
        <div className="bg-slate-900 p-8 text-center">
          <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center font-bold text-3xl text-white mx-auto mb-4">E</div>
          <h1 className="text-2xl font-bold text-white">{APP_NAME}</h1>
          <p className="text-slate-400 mt-2">Gestão Inteligente de Avaliações</p>
        </div>
        
        <form onSubmit={handleLogin} className="p-8 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 block ml-1">Usuário</label>
            <input
              type="text"
              required
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="Digite seu usuário ou nome"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 block ml-1">Senha</label>
            <input
              type="password"
              required
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 active:scale-[0.98] transition-all shadow-lg shadow-blue-200"
          >
            Acessar Sistema
          </button>
        </form>

        <div className="p-6 bg-slate-50 text-center border-t border-slate-100">
          <p className="text-xs text-slate-500">
            Dica Master: Use seu nome completo e a senha inicial definida.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
