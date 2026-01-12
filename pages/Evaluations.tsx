
import React, { useState, useEffect } from 'react';
import { Evaluation, KnowledgeItem, Company, Sector, Role, Question } from '../types';
import { Store } from '../store';
import { generateEvaluationQuestions } from '../services/geminiService';

const Evaluations: React.FC = () => {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [knowledge, setKnowledge] = useState<KnowledgeItem[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form
  const [title, setTitle] = useState('');
  const [theme, setTheme] = useState('');
  const [selectedKnowledgeId, setSelectedKnowledgeId] = useState('');
  const [questionCount, setQuestionCount] = useState<10 | 20>(10);
  const [difficulty, setDifficulty] = useState<'Básico' | 'Médio' | 'Avançado'>('Médio');
  const [tempQuestions, setTempQuestions] = useState<Question[]>([]);
  
  // Publication
  const [targetCompany, setTargetCompany] = useState('');
  const [targetSector, setTargetSector] = useState('');
  const [targetRole, setTargetRole] = useState('');

  useEffect(() => {
    setEvaluations(Store.getEvaluations());
    setKnowledge(Store.getKnowledge());
    setCompanies(Store.getCompanies());
    setSectors(Store.getSectors());
    setRoles(Store.getRoles());
  }, []);

  const handleGenerate = async () => {
    if (!selectedKnowledgeId || !theme || !title) {
      alert("Preencha todos os campos antes de gerar.");
      return;
    }

    const item = knowledge.find(k => k.id === selectedKnowledgeId);
    if (!item) return;

    setIsLoading(true);
    try {
      const questions = await generateEvaluationQuestions(theme, item.content, questionCount, difficulty);
      setTempQuestions(questions);
    } catch (err) {
      alert("Erro ao gerar avaliação. Verifique sua chave de API ou tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublish = () => {
    if (tempQuestions.length === 0) return;

    const newEval: Evaluation = {
      id: crypto.randomUUID(),
      title,
      theme,
      knowledgeItemId: selectedKnowledgeId,
      questions: tempQuestions,
      target: {
        companyId: targetCompany || undefined,
        sectorId: targetSector || undefined,
        roleId: targetRole || undefined
      },
      createdAt: Date.now(),
      published: true
    };

    const updated = [newEval, ...evaluations];
    setEvaluations(updated);
    Store.saveEvaluations(updated);
    setIsGenerating(false);
    setTempQuestions([]);
    resetForm();
  };

  const resetForm = () => {
    setTitle(''); setTheme(''); setSelectedKnowledgeId('');
    setTargetCompany(''); setTargetSector(''); setTargetRole('');
    setQuestionCount(10); setDifficulty('Médio');
  };

  const deleteEval = (id: string) => {
    if (confirm("Excluir esta avaliação?")) {
      const updated = evaluations.filter(e => e.id !== id);
      setEvaluations(updated);
      Store.saveEvaluations(updated);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Avaliações</h1>
          <p className="text-slate-500">Gere novas provas usando IA ou publique avaliações existentes.</p>
        </div>
        {!isGenerating && (
          <button
            onClick={() => setIsGenerating(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <span>🤖</span> Criar com IA
          </button>
        )}
      </div>

      {isGenerating ? (
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold">Gerador Automático de Avaliações</h2>
            <button onClick={() => { setIsGenerating(false); setTempQuestions([]); }} className="text-slate-400 hover:text-slate-600">Fechar</button>
          </div>

          {!tempQuestions.length ? (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-1">Título da Prova</label>
                  <input type="text" className="w-full px-4 py-3 border rounded-xl" placeholder="Ex: Avaliação Periódica de Compliance" value={title} onChange={e => setTitle(e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-1">Fonte de Conhecimento</label>
                  <select className="w-full px-4 py-3 border rounded-xl" value={selectedKnowledgeId} onChange={e => setSelectedKnowledgeId(e.target.value)}>
                    <option value="">Selecione um arquivo...</option>
                    {knowledge.map(k => <option key={k.id} value={k.id}>{k.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-1">Tema Específico</label>
                  <input type="text" className="w-full px-4 py-3 border rounded-xl" placeholder="Ex: Ética e Proteção de Dados" value={theme} onChange={e => setTheme(e.target.value)} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="text-sm font-semibold text-slate-700 block mb-1">Quantidade de Questões</label>
                    <div className="flex bg-slate-100 p-1 rounded-xl">
                      <button 
                        onClick={() => setQuestionCount(10)}
                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${questionCount === 10 ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                      >
                        10 Questões
                      </button>
                      <button 
                        onClick={() => setQuestionCount(20)}
                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${questionCount === 20 ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                      >
                        20 Questões
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-slate-700 block mb-1">Nível de Dificuldade</label>
                    <select 
                      className="w-full px-4 py-2 border rounded-xl font-medium bg-white" 
                      value={difficulty} 
                      onChange={e => setDifficulty(e.target.value as any)}
                    >
                      <option value="Básico">Básico</option>
                      <option value="Médio">Médio</option>
                      <option value="Avançado">Avançado</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <button
                onClick={handleGenerate}
                disabled={isLoading}
                className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-3 disabled:bg-slate-400"
              >
                {isLoading ? (
                  <><span className="animate-spin text-xl">⏳</span> Analisando conteúdo e criando {questionCount} questões...</>
                ) : (
                  <><span className="text-xl">✨</span> Gerar {questionCount} Questões</>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="p-4 bg-green-50 border border-green-100 rounded-2xl flex justify-between items-center">
                <span className="text-green-700 font-medium">✨ {tempQuestions.length} questões ({difficulty}) geradas com sucesso! Revise antes de publicar.</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                  {tempQuestions.map((q, idx) => (
                    <div key={idx} className="p-4 bg-slate-50 border rounded-2xl relative">
                      <span className="absolute -top-3 -left-3 w-8 h-8 bg-slate-800 text-white rounded-full flex items-center justify-center text-xs font-bold">{idx + 1}</span>
                      <p className="font-bold mb-4">{q.enunciado}</p>
                      <ul className="space-y-2">
                        {q.alternativas.map((alt, i) => (
                          <li key={i} className={`text-sm p-2 rounded-lg ${q.correta === i ? 'bg-green-100 text-green-700 border border-green-200 font-bold' : 'text-slate-600'}`}>
                            {String.fromCharCode(65 + i)}) {alt}
                          </li>
                        ))}
                      </ul>
                      <div className="mt-4 pt-4 border-t border-slate-200 text-xs text-slate-500 italic">
                        <strong>Justificativa:</strong> {q.justificativa}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-6">
                  <div className="bg-slate-50 p-6 rounded-3xl border">
                    <h3 className="text-lg font-bold mb-4">Configurações de Publicação</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs uppercase font-bold text-slate-400 mb-2 block">Público Alvo (Empresa)</label>
                        <select className="w-full px-4 py-2 border rounded-xl" value={targetCompany} onChange={e => setTargetCompany(e.target.value)}>
                          <option value="">Todas as Empresas</option>
                          {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      </div>
                      
                      {targetCompany && (
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs uppercase font-bold text-slate-400 mb-2 block">Setor</label>
                            <select className="w-full px-4 py-2 border rounded-xl" value={targetSector} onChange={e => setTargetSector(e.target.value)}>
                              <option value="">Todos os Setores</option>
                              {sectors.filter(s => s.companyId === targetCompany).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="text-xs uppercase font-bold text-slate-400 mb-2 block">Cargo</label>
                            <select className="w-full px-4 py-2 border rounded-xl" value={targetRole} onChange={e => setTargetRole(e.target.value)}>
                              <option value="">Todos os Cargos</option>
                              {roles.filter(r => r.companyId === targetCompany).map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                            </select>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <button
                      onClick={handlePublish}
                      className="w-full mt-6 bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                    >
                      Publicar Avaliação Agora
                    </button>
                    <button
                      onClick={() => setTempQuestions([])}
                      className="w-full mt-2 text-slate-400 py-2 text-sm hover:text-slate-600 font-medium"
                    >
                      Descartar e recomeçar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {evaluations.map(evalu => (
            <div key={evalu.id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <span className="bg-green-100 text-green-700 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded">Ativa</span>
                <button onClick={() => deleteEval(evalu.id)} className="text-slate-300 hover:text-red-500">🗑️</button>
              </div>
              <h3 className="font-bold text-lg mb-1 leading-tight">{evalu.title}</h3>
              <p className="text-xs text-slate-400 mb-4">{evalu.theme}</p>
              
              <div className="space-y-2 mb-6 flex-1">
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <span className="w-5 text-center">🏢</span>
                  <span>{evalu.target.companyId ? companies.find(c => c.id === evalu.target.companyId)?.name : 'Todas Empresas'}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <span className="w-5 text-center">🎯</span>
                  <span>
                    {evalu.target.sectorId ? sectors.find(s => s.id === evalu.target.sectorId)?.name : 'Global'} / 
                    {evalu.target.roleId ? roles.find(r => r.id === evalu.target.roleId)?.name : 'Todos'}
                  </span>
                </div>
              </div>
              
              <div className="pt-4 border-t flex justify-between items-center text-xs text-slate-400">
                <span>{evalu.questions.length} Questões</span>
                <span>{new Date(evalu.createdAt).toLocaleDateString('pt-BR')}</span>
              </div>
            </div>
          ))}
          {evaluations.length === 0 && (
            <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-slate-200 border-dashed">
              <span className="text-5xl block mb-4">✍️</span>
              <p className="text-slate-500">Nenhuma avaliação publicada.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Evaluations;
