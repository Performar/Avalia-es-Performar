
import React, { useState, useEffect } from 'react';
import { User, Evaluation } from './types';
import { Store } from './store';
import Layout from './components/Layout';
import Login from './pages/Login';
import KnowledgeBase from './pages/KnowledgeBase';
import Companies from './pages/Companies';
import Evaluations from './pages/Evaluations';
import Reports from './pages/Reports';
import SectorReports from './pages/SectorReports';
import EmployeeDashboard from './pages/EmployeeDashboard';
import TakeEvaluation from './pages/TakeEvaluation';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [activeEvaluation, setActiveEvaluation] = useState<Evaluation | null>(null);

  useEffect(() => {
    const auth = Store.getAuth();
    if (auth) {
      setUser(auth);
    }
  }, []);

  const handleLogin = (u: User) => {
    setUser(u);
    Store.setAuth(u);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    Store.setAuth(null);
    setActiveEvaluation(null);
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  if (activeEvaluation) {
    return (
      <div className="min-h-screen bg-slate-50">
        <TakeEvaluation 
          evaluation={activeEvaluation} 
          user={user} 
          onFinish={() => setActiveEvaluation(null)} 
        />
      </div>
    );
  }

  const renderContent = () => {
    if (user.role === 'MASTER_ADMIN') {
      switch (currentPage) {
        case 'knowledge': return <KnowledgeBase />;
        case 'companies': return <Companies />;
        case 'evaluations': return <Evaluations />;
        case 'reports': return <Reports />;
        default: return <Reports />;
      }
    } else if (user.role === 'MANAGER') {
      switch (currentPage) {
        case 'dashboard': return <SectorReports manager={user} />;
        case 'history': return (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold">Meu Histórico Pessoal</h1>
            <EmployeeDashboard user={user} onTakeEvaluation={setActiveEvaluation} />
          </div>
        );
        case 'my_evaluations': return <EmployeeDashboard user={user} onTakeEvaluation={setActiveEvaluation} />;
        default: return <SectorReports manager={user} />;
      }
    } else {
      switch (currentPage) {
        case 'history': return (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold">Meu Histórico</h1>
            <EmployeeDashboard user={user} onTakeEvaluation={setActiveEvaluation} />
          </div>
        );
        default: return <EmployeeDashboard user={user} onTakeEvaluation={setActiveEvaluation} />;
      }
    }
  };

  return (
    <Layout 
      user={user} 
      onLogout={handleLogout} 
      currentPage={currentPage} 
      setCurrentPage={setCurrentPage}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;
