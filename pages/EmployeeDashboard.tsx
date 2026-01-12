
import React, { useState, useEffect } from 'react';
import { Evaluation, Submission, User, Company } from '../types';
import { Store } from '../store';

interface EmployeeDashboardProps {
  user: User;
  onTakeEvaluation: (evaluation: Evaluation) => void;
}

const EmployeeDashboard: React.FC<EmployeeDashboardProps> = ({ user, onTakeEvaluation }) => {
  const [availableEvaluations, setAvailableEvaluations] = useState<Evaluation[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  useEffect(() => {
    const allEvals = Store.getEvaluations();
    const allSubs = Store.getSubmissions();
    const mySubs = allSubs.filter(s => s.userId === user.id);
    
    // Filter available evaluations based on target logic
    const filtered = allEvals.filter(ev => {
      // Must be published
      if (!ev.published) return false;
      
      // Must not have taken it yet
      if (mySubs.find(s => s.evaluationId === ev.id)) return false;

      // Target logic
      if (!ev.target.companyId) return true; // Global
      if (ev.target.companyId !== user.companyId) return false; // Different company
      
      if (ev.target.sectorId && ev.target.sectorId !== user.sectorId) return false; // Different sector
      if (ev.target.roleId && ev.target.roleId !== user.roleId) return false; // Different role
      
      return true;
    });

    setAvailableEvaluations(filtered);
    setSubmissions(mySubs);
  }, [user]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Olá, {user.name.split(' ')[0]}! 👋</h1>
        <p className="text-slate-500 font-medium">Você tem {availableEvaluations.length} avaliações aguardando resposta.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {availableEvaluations.map(ev => (
          <div key={ev.id} className="bg-white p-8 rounded-[2rem] shadow-sm border-2 border-slate-100 hover:border-blue-500 hover:shadow-xl hover:shadow-blue-50 transition-all group flex flex-col">
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">📝</div>
            <h3 className="text-xl font-bold mb-2 leading-tight group-hover:text-blue-700 transition-colors">{ev.title}</h3>
            <p className="text-sm text-slate-500 mb-6 flex-1 line-clamp-2">{ev.theme}</p>
            <button 
              onClick={() => onTakeEvaluation(ev)}
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-blue-600 active:scale-[0.98] transition-all"
            >
              Iniciar Avaliação
            </button>
          </div>
        ))}
        {availableEvaluations.length === 0 && (
          <div className="col-span-full py-16 text-center bg-white rounded-[2rem] border-2 border-dashed border-slate-200">
            <span className="text-5xl block mb-4">🎉</span>
            <p className="text-slate-500 font-bold">Tudo em dia! Nenhuma avaliação pendente.</p>
          </div>
        )}
      </div>

      {submissions.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Histórico de Resultados</h2>
          <div className="grid grid-cols-1 gap-4">
            {submissions.map(sub => {
              const ev = Store.getEvaluations().find(e => e.id === sub.evaluationId);
              return (
                <div key={sub.id} className="bg-white p-6 rounded-3xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-800">{ev?.title || 'Avaliação Antiga'}</p>
                    <p className="text-xs text-slate-400">{new Date(sub.timestamp).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Resultado</p>
                      <p className={`text-2xl font-black ${sub.score >= 70 ? 'text-green-600' : 'text-red-600'}`}>
                        {sub.score}%
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeDashboard;
