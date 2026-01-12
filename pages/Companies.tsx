
import React, { useState, useEffect } from 'react';
import { Company, Sector, Role, User, UserRole } from '../types';
import { Store } from '../store';

const Companies: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  // UI States
  const [activeTab, setActiveTab] = useState<'companies' | 'employees'>('companies');
  const [isAddingCompany, setIsAddingCompany] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState('');
  
  // Specific entry states
  const [activeSectorInput, setActiveSectorInput] = useState<string | null>(null);
  const [newSectorName, setNewSectorName] = useState('');
  const [activeRoleInput, setActiveRoleInput] = useState<string | null>(null);
  const [newRoleName, setNewRoleName] = useState('');

  useEffect(() => {
    setCompanies(Store.getCompanies());
    setSectors(Store.getSectors());
    setRoles(Store.getRoles());
    setUsers(Store.getUsers());
  }, []);

  const generateId = () => crypto.randomUUID();

  const handleAddCompany = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompanyName.trim()) return;
    const newList = [...companies, { id: generateId(), name: newCompanyName.trim() }];
    setCompanies(newList);
    Store.saveCompanies(newList);
    setNewCompanyName('');
    setIsAddingCompany(false);
  };

  const deleteCompany = (id: string) => {
    if (confirm("Isso excluirá a empresa e todos os seus vínculos. Continuar?")) {
      const newList = companies.filter(c => c.id !== id);
      setCompanies(newList);
      Store.saveCompanies(newList);
      const newSectors = sectors.filter(s => s.companyId !== id);
      setSectors(newSectors);
      Store.saveSectors(newSectors);
      const newRoles = roles.filter(r => r.companyId !== id);
      setRoles(newRoles);
      Store.saveRoles(newRoles);
    }
  };

  const handleAddSector = (companyId: string) => {
    if (!newSectorName.trim()) return;
    const newList = [...sectors, { id: generateId(), companyId, name: newSectorName.trim() }];
    setSectors(newList);
    Store.saveSectors(newList);
    setNewSectorName('');
    setActiveSectorInput(null);
  };

  const handleAddRole = (companyId: string) => {
    if (!newRoleName.trim()) return;
    const newList = [...roles, { id: generateId(), companyId, name: newRoleName.trim() }];
    setRoles(newList);
    Store.saveRoles(newList);
    setNewRoleName('');
    setActiveRoleInput(null);
  };

  // Employee Form
  const [empName, setEmpName] = useState('');
  const [empUser, setEmpUser] = useState('');
  const [empPass, setEmpPass] = useState('');
  const [empComp, setEmpComp] = useState('');
  const [empSect, setEmpSect] = useState('');
  const [empRole, setEmpRole] = useState('');
  const [empType, setEmpType] = useState<UserRole>('EMPLOYEE');

  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empName || !empUser || !empPass || !empComp) return;
    
    const newUser: User = {
      id: generateId(),
      name: empName,
      username: empUser.toLowerCase().replace(/\s/g, ''),
      password: empPass,
      role: empType,
      companyId: empComp,
      sectorId: empSect || undefined,
      roleId: empRole || undefined
    };

    const updated = [...users, newUser];
    setUsers(updated);
    Store.saveUsers(updated);
    
    setEmpName(''); setEmpUser(''); setEmpPass(''); setEmpComp(''); setEmpSect(''); setEmpRole(''); setEmpType('EMPLOYEE');
  };

  const deleteUser = (id: string) => {
    if (confirm("Deseja excluir este usuário?")) {
      const updated = users.filter(u => u.id !== id);
      setUsers(updated);
      Store.saveUsers(updated);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Empresas & Pessoal</h1>
          <p className="text-slate-500 font-medium">Configure a estrutura organizacional e gerencie os acessos.</p>
        </div>
      </div>

      <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200 w-fit">
        <button 
          onClick={() => setActiveTab('companies')}
          className={`px-8 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'companies' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          Estrutura Organizacional
        </button>
        <button 
          onClick={() => setActiveTab('employees')}
          className={`px-8 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'employees' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          Usuários & Gestores
        </button>
      </div>

      {activeTab === 'companies' ? (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-800">Empresas Cadastradas</h2>
            {!isAddingCompany && (
              <button 
                onClick={() => setIsAddingCompany(true)}
                className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center gap-2"
              >
                <span>🏢</span> Nova Empresa
              </button>
            )}
          </div>

          {isAddingCompany && (
            <div className="bg-blue-50 p-6 rounded-3xl border-2 border-blue-200 animate-in slide-in-from-top-4 duration-300">
              <form onSubmit={handleAddCompany} className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 space-y-2">
                  <label className="text-xs font-black text-blue-700 uppercase tracking-widest ml-1">Nome da Nova Empresa</label>
                  <input 
                    autoFocus
                    type="text" 
                    placeholder="Ex: Tecnologia S.A." 
                    className="w-full px-5 py-3 rounded-2xl border-2 border-blue-100 focus:border-blue-500 focus:outline-none transition-all text-lg font-semibold"
                    value={newCompanyName}
                    onChange={(e) => setNewCompanyName(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="bg-blue-600 text-white px-8 py-3.5 rounded-2xl font-bold hover:bg-blue-700 shadow-lg transition-all">
                    Salvar Empresa
                  </button>
                  <button type="button" onClick={() => setIsAddingCompany(false)} className="bg-white text-slate-500 px-6 py-3.5 rounded-2xl font-bold hover:bg-slate-100 transition-all border border-blue-100">
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="grid grid-cols-1 gap-6">
            {companies.map(comp => (
              <div key={comp.id} className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden group hover:shadow-xl hover:border-blue-200 transition-all duration-300">
                <div className="p-8 bg-slate-50/50 border-b flex justify-between items-center">
                  <div>
                    <h3 className="text-2xl font-black text-slate-800">{comp.name}</h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">ID: {comp.id.substring(0, 8)}</p>
                  </div>
                  <button onClick={() => deleteCompany(comp.id)} className="text-slate-300 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-xl">
                    <span className="text-xl">🗑️</span>
                  </button>
                </div>
                
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-xs uppercase font-black text-slate-400 tracking-[0.2em]">Setores</h4>
                      <button onClick={() => setActiveSectorInput(comp.id)} className="text-blue-600 text-xs font-black hover:underline">+ ADICIONAR</button>
                    </div>
                    {activeSectorInput === comp.id && (
                      <div className="flex gap-2 animate-in fade-in zoom-in-95 duration-200">
                        <input autoFocus type="text" placeholder="Nome do setor..." className="flex-1 px-4 py-2 bg-blue-50 border border-blue-200 rounded-xl text-sm focus:outline-none" value={newSectorName} onChange={(e) => setNewSectorName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddSector(comp.id)} />
                        <button onClick={() => handleAddSector(comp.id)} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold">OK</button>
                        <button onClick={() => setActiveSectorInput(null)} className="bg-slate-200 text-slate-500 px-4 py-2 rounded-xl text-xs font-bold">X</button>
                      </div>
                    )}
                    <div className="grid grid-cols-1 gap-2">
                      {sectors.filter(s => s.companyId === comp.id).map(s => (
                        <div key={s.id} className="p-4 bg-white rounded-2xl text-sm font-bold text-slate-700 border border-slate-100 flex justify-between items-center group/item hover:border-blue-200 hover:bg-blue-50/30 transition-all">
                          <span>{s.name}</span>
                          <button onClick={() => { const newList = sectors.filter(sec => sec.id !== s.id); setSectors(newList); Store.saveSectors(newList); }} className="opacity-0 group-hover/item:opacity-100 text-red-300 hover:text-red-500 transition-all">🗑️</button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-xs uppercase font-black text-slate-400 tracking-[0.2em]">Cargos/Funções</h4>
                      <button onClick={() => setActiveRoleInput(comp.id)} className="text-green-600 text-xs font-black hover:underline">+ ADICIONAR</button>
                    </div>
                    {activeRoleInput === comp.id && (
                      <div className="flex gap-2 animate-in fade-in zoom-in-95 duration-200">
                        <input autoFocus type="text" placeholder="Nome do cargo..." className="flex-1 px-4 py-2 bg-green-50 border border-green-200 rounded-xl text-sm focus:outline-none" value={newRoleName} onChange={(e) => setNewRoleName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddRole(comp.id)} />
                        <button onClick={() => handleAddRole(comp.id)} className="bg-green-600 text-white px-4 py-2 rounded-xl text-xs font-bold">OK</button>
                        <button onClick={() => setActiveRoleInput(null)} className="bg-slate-200 text-slate-500 px-4 py-2 rounded-xl text-xs font-bold">X</button>
                      </div>
                    )}
                    <div className="grid grid-cols-1 gap-2">
                      {roles.filter(r => r.companyId === comp.id).map(r => (
                        <div key={r.id} className="p-4 bg-white rounded-2xl text-sm font-bold text-slate-700 border border-slate-100 flex justify-between items-center group/item hover:border-green-200 hover:bg-green-50/30 transition-all">
                          <span>{r.name}</span>
                          <button onClick={() => { const newList = roles.filter(rol => rol.id !== r.id); setRoles(newList); Store.saveRoles(newList); }} className="opacity-0 group-hover/item:opacity-100 text-red-300 hover:text-red-500 transition-all">🗑️</button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm sticky top-8">
              <h3 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-2">
                <span className="text-blue-600">👤</span> Cadastrar Acesso
              </h3>
              <form onSubmit={handleAddEmployee} className="space-y-5">
                <div className="flex p-1 bg-slate-100 rounded-xl mb-4">
                  <button type="button" onClick={() => setEmpType('EMPLOYEE')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${empType === 'EMPLOYEE' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}>FUNCIONÁRIO</button>
                  <button type="button" onClick={() => setEmpType('MANAGER')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${empType === 'MANAGER' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}>GESTOR</button>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome Completo</label>
                  <input type="text" placeholder="Ex: João da Silva" required className="w-full px-5 py-3 border-2 border-slate-100 rounded-2xl focus:border-blue-500 focus:outline-none transition-all font-medium" value={empName} onChange={e => setEmpName(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Login</label>
                    <input type="text" placeholder="joao.silva" required className="w-full px-5 py-3 border-2 border-slate-100 rounded-2xl focus:border-blue-500 focus:outline-none transition-all font-medium" value={empUser} onChange={e => setEmpUser(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Senha</label>
                    <input type="password" placeholder="••••" required className="w-full px-5 py-3 border-2 border-slate-100 rounded-2xl focus:border-blue-500 focus:outline-none transition-all font-medium" value={empPass} onChange={e => setEmpPass(e.target.value)} />
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Empresa</label>
                  <select required className="w-full px-5 py-3 border-2 border-slate-100 rounded-2xl focus:border-blue-500 focus:outline-none transition-all font-medium bg-white" value={empComp} onChange={e => { setEmpComp(e.target.value); setEmpSect(''); setEmpRole(''); }}>
                    <option value="">Selecione...</option>
                    {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                
                {empComp && (
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{empType === 'MANAGER' ? 'Setor do Gestor' : 'Setor'}</label>
                      <select required={empType === 'MANAGER'} className="w-full px-5 py-3 border-2 border-slate-100 rounded-2xl focus:border-blue-500 focus:outline-none transition-all font-medium bg-white" value={empSect} onChange={e => setEmpSect(e.target.value)}>
                        <option value="">{empType === 'MANAGER' ? 'Selecione o setor...' : 'Nenhum específico'}</option>
                        {sectors.filter(s => s.companyId === empComp).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </div>
                    {empType === 'EMPLOYEE' && (
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cargo</label>
                        <select className="w-full px-5 py-3 border-2 border-slate-100 rounded-2xl focus:border-blue-500 focus:outline-none transition-all font-medium bg-white" value={empRole} onChange={e => setEmpRole(e.target.value)}>
                          <option value="">Nenhum específico</option>
                          {roles.filter(r => r.companyId === empComp).map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                        </select>
                      </div>
                    )}
                  </div>
                )}
                <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black hover:bg-blue-600 transition-all shadow-xl shadow-slate-100">FINALIZAR CADASTRO</button>
              </form>
            </div>
          </div>
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-xl font-black text-slate-800">Usuários Ativos</h3>
            <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nome</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Perfil</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Setor / Cargo</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-blue-50/20 transition-colors">
                      <td className="px-8 py-5">
                        <p className="font-black text-slate-800">{u.name}</p>
                        <p className="text-xs text-slate-400 font-bold">@{u.username}</p>
                      </td>
                      <td className="px-8 py-5">
                        <span className={`text-[10px] font-black px-3 py-1 rounded-lg uppercase ${u.role === 'MANAGER' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
                          {u.role === 'MANAGER' ? 'Gestor' : 'Funcionário'}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <p className="text-xs font-bold text-slate-600">{sectors.find(s => s.id === u.sectorId)?.name || 'N/A'}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">{roles.find(r => r.id === u.roleId)?.name || 'N/A'}</p>
                      </td>
                      <td className="px-8 py-5 text-right"><button onClick={() => deleteUser(u.id)} className="text-slate-300 hover:text-red-500">🗑️</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Companies;
