
import React, { useState, useEffect } from 'react';
import { User, Submission, Evaluation, Role, Sector, Company } from '../types';
import { Store } from '../store';

interface SectorReportsProps {
  manager: User;
}

const SectorReports: React.FC<SectorReportsProps> = ({ manager }) => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [employees, setEmployees] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [sector, setSector] = useState<Sector | null>(null);

  // Filters
  const [filterRoleId, setFilterRoleId] = useState('all');
  const [filterUserId, setFilterUserId] = useState('all');

  useEffect(() => {
    const allSubs = Store.getSubmissions();
    const allUsers = Store.getUsers();
    const allRoles = Store.getRoles();
    const allSectors = Store.getSectors();
    const allEvals = Store.getEvaluations();

    // Colaboradores do setor do gestor
    const sectorEmployees = allUsers.filter(u => u.sectorId === manager.sectorId && u.role === 'EMPLOYEE');
    const employeeIds = sectorEmployees.map(e => e.id);
    
    // Submissões apenas desses colaboradores
    const sectorSubs = allSubs.filter(s => employeeIds.includes(s.userId));
    
    setEmployees(sectorEmployees);
    setSubmissions(sectorSubs);
    setEvaluations(allEvals);
    setRoles(allRoles.filter(r => r.companyId === manager.companyId));
    setSector(allSectors.find(s => s.id === manager.sectorId) || null);
  }, [manager]);

  const filteredSubmissions = submissions.filter(sub => {
    const user = employees.find(e => e.id === sub.userId);
    if (!user) return false;
    const matchesRole = filterRoleId === 'all' || user.roleId === filterRoleId;
    const matchesUser = filterUserId === 'all' || sub.userId === filterUserId;
    return matchesRole && matchesUser;
  });

  const avgScore = filteredSubmissions.length > 0 
    ? (filteredSubmissions.reduce((acc, s) => acc + s.score, 0) / filteredSubmissions.length).toFixed(1)
    : '0';

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Gestão do Setor: {sector?.name}</h1>
          <p className="text-slate-500 font-medium">Acompanhe o desempenho do seu time e identifique gaps de conhecimento.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex flex-wrap gap-6 items-center">
        <div className="flex-1 min-w-[200px] space-y-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Filtrar por Cargo</label>
          <select 
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl font-bold text-slate-700 focus:outline-none"
            value={filterRoleId} onChange={e => { setFilterRoleId(e.target.value); setFilterUserId('all'); }}
          >
            <option value="all">Todos os Cargos</option>
            {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </div>
        <div className="flex-1 min-w-[200px] space-y-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Filtrar por Colaborador</label>
          <select 
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl font-bold text-slate-700 focus:outline-none"
            value={filterUserId} onChange={e => setFilterUserId(e.target.value)}
          >
            <option value="all">Todos os Colaboradores</option>
            {employees.filter(e => filterRoleId === 'all' || e.roleId === filterRoleId).map(e => (
              <option key={e.id} value={e.id}>{e.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col justify-between">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Média de Acertos</p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-5xl font-black text-blue-600 tracking-tighter">{avgScore}%</span>
            <span className="text-xs text-slate-400 font-bold uppercase">Setorial</span>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col justify-between">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Total de Provas</p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-5xl font-black text-slate-900 tracking-tighter">{filteredSubmissions.length}</span>
            <span className="text-xs text-slate-400 font-bold uppercase">Realizadas</span>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col justify-between">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Time Direto</p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-5xl font-black text-green-600 tracking-tighter">{employees.length}</span>
            <span className="text-xs text-slate-400 font-bold uppercase">Membros</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-8 border-b bg-slate-50/50">
          <h3 className="text-xl font-black text-slate-800 tracking-tight">Atividade Recente do Time</h3>
        </div>
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Colaborador</th>
              <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Avaliação</th>
              <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Data</th>
              <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Resultado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredSubmissions.map(sub => {
              const emp = employees.find(e => e.id === sub.userId);
              const ev = evaluations.find(e => e.id === sub.evaluationId);
              return (
                <tr key={sub.id} className="hover:bg-blue-50/20 transition-colors group">
                  <td className="px-8 py-5">
                    <p className="font-black text-slate-800">{emp?.name}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">{roles.find(r => r.id === emp?.roleId)?.name}</p>
                  </td>
                  <td className="px-8 py-5">
                    <p className="text-sm font-bold text-slate-600">{ev?.title}</p>
                  </td>
                  <td className="px-8 py-5">
                    <p className="text-xs text-slate-400 font-bold">{new Date(sub.timestamp).toLocaleDateString('pt-BR')}</p>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <span className={`text-lg font-black ${sub.score >= 70 ? 'text-green-600' : 'text-red-600'}`}>
                      {sub.score}%
                    </span>
                  </td>
                </tr>
              );
            })}
            {filteredSubmissions.length === 0 && (
              <tr>
                <td colSpan={4} className="py-20 text-center">
                  <span className="text-4xl block mb-4">📈</span>
                  <p className="text-slate-400 font-bold italic">Nenhum dado encontrado para os filtros selecionados.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SectorReports;
