
import React, { useState, useEffect } from 'react';
import { Submission, Evaluation, Company, User } from '../types';
import { Store } from '../store';

const Reports: React.FC = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedEvalId, setSelectedEvalId] = useState<string>('all');
  
  const refreshData = () => {
    setSubmissions(Store.getSubmissions());
    setEvaluations(Store.getEvaluations());
    setCompanies(Store.getCompanies());
    setUsers(Store.getUsers());
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleExportBackup = () => {
    const data = Store.exportAllData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup_evalai_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (Store.importAllData(content)) {
        alert("Dados restaurados com sucesso! A aplicação será reiniciada.");
        window.location.reload();
      } else {
        alert("Erro ao importar backup. Verifique se o arquivo é um JSON válido do EvalAI.");
      }
    };
    reader.readAsText(file);
  };

  const filteredSubmissions = selectedEvalId === 'all' 
    ? submissions 
    : submissions.filter(s => s.evaluationId === selectedEvalId);

  const totalSubmissions = filteredSubmissions.length;
  const averageScore = totalSubmissions > 0 
    ? (filteredSubmissions.reduce((acc, s) => acc + s.score, 0) / totalSubmissions).toFixed(1) 
    : '0';

  const statsByCompany = companies.map(comp => {
    const compUsers = users.filter(u => u.companyId === comp.id).map(u => u.id);
    const compSubs = filteredSubmissions.filter(s => compUsers.includes(s.userId));
    const avg = compSubs.length > 0 
      ? (compSubs.reduce((acc, s) => acc + s.score, 0) / compSubs.length).toFixed(1)
      : '0';
    return { name: comp.name, count: compSubs.length, avg };
  });

  interface QuestionStat {
    index: number;
    enunciado: string;
    correctCount: number;
    totalCount: number;
    percentage: number;
  }

  let questionStats: QuestionStat[] = [];
  if (selectedEvalId !== 'all') {
    const currentEval = evaluations.find(e => e.id === selectedEvalId);
    if (currentEval) {
      questionStats = currentEval.questions.map((q, qIdx) => {
        const total = filteredSubmissions.length;
        const correct = filteredSubmissions.filter(s => s.answers[qIdx] === q.correta).length;
        return {
          index: qIdx + 1,
          enunciado: q.enunciado,
          correctCount: correct,
          totalCount: total,
          percentage: total > 0 ? (correct / total) * 100 : 0
        };
      });
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Relatórios Master</h1>
          <p className="text-slate-500 font-medium">Acompanhe o desempenho global e gerencie a segurança.</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Filtrar:</label>
          <select 
            className="bg-transparent px-4 py-2 rounded-xl text-sm font-bold focus:outline-none"
            value={selectedEvalId}
            onChange={(e) => setSelectedEvalId(e.target.value)}
          >
            <option value="all">Todas as Avaliações</option>
            {evaluations.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200 flex flex-col justify-between group hover:border-blue-200 transition-all">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Média Geral</p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-5xl font-black text-blue-600 tracking-tighter">{averageScore}%</span>
            <span className="text-xs text-slate-400 font-bold uppercase">Acertos</span>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200 flex flex-col justify-between group hover:border-blue-200 transition-all">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Participações</p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-5xl font-black text-slate-900 tracking-tighter">{totalSubmissions}</span>
            <span className="text-xs text-slate-400 font-bold uppercase">Provas</span>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200 flex flex-col justify-between group hover:border-blue-200 transition-all">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Empresas</p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-5xl font-black text-green-600 tracking-tighter">{companies.length}</span>
            <span className="text-xs text-slate-400 font-bold uppercase">Ativas</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm">
          <h3 className="text-xl font-black text-slate-800 mb-8">Performance por Empresa</h3>
          <div className="space-y-8">
            {statsByCompany.map(stat => (
              <div key={stat.name} className="group">
                <div className="flex justify-between items-end mb-3">
                  <span className="font-black text-slate-700">{stat.name}</span>
                  <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{stat.count} participações • {stat.avg}%</span>
                </div>
                <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${parseFloat(stat.avg) >= 70 ? 'bg-green-500' : 'bg-blue-500'}`}
                    style={{ width: `${stat.avg}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* GESTÃO DE DADOS */}
        <div className="bg-slate-900 p-10 rounded-[2.5rem] shadow-2xl text-white">
          <h3 className="text-xl font-black mb-2 flex items-center gap-3">
            <span className="text-blue-400">🛡️</span> Segurança e Backup
          </h3>
          <p className="text-slate-400 text-sm mb-10">Baixe ou restaure todos os dados do sistema (Empresas, Usuários e Provas).</p>
          
          <div className="space-y-4">
            <button 
              onClick={handleExportBackup}
              className="w-full bg-white/10 hover:bg-white/20 border border-white/10 p-6 rounded-3xl flex items-center justify-between transition-all group"
            >
              <div className="text-left">
                <p className="font-black text-white">Exportar Tudo (Backup)</p>
                <p className="text-xs text-slate-400">Gera um arquivo .json com todos os registros</p>
              </div>
              <span className="text-2xl group-hover:translate-y-1 transition-transform">📥</span>
            </button>

            <div className="relative group">
              <input 
                type="file" 
                accept=".json" 
                onChange={handleImportBackup}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="w-full bg-blue-600 hover:bg-blue-500 p-6 rounded-3xl flex items-center justify-between transition-all">
                <div className="text-left">
                  <p className="font-black text-white">Restaurar Dados</p>
                  <p className="text-xs text-blue-100">Carrega dados de um arquivo de backup anterior</p>
                </div>
                <span className="text-2xl group-hover:-translate-y-1 transition-transform">📤</span>
              </div>
            </div>
          </div>

          <div className="mt-10 p-5 bg-white/5 rounded-2xl border border-white/5">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Importante</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Atualmente os dados são salvos apenas no seu navegador. Para maior segurança, exporte um backup semanalmente ou migre para um banco de dados em nuvem.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
