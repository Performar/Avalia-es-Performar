
import React, { useState, useEffect } from 'react';
import { KnowledgeItem, Company } from '../types';
import { Store } from '../store';

// Declarações globais para as bibliotecas carregadas via CDN
declare const mammoth: any;
declare const pdfjsLib: any;

const KnowledgeBase: React.FC = () => {
  const [items, setItems] = useState<KnowledgeItem[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [companyId, setCompanyId] = useState<'GLOBAL' | string>('GLOBAL');
  const [content, setContent] = useState('');
  const [fileName, setFileName] = useState('');

  useEffect(() => {
    setItems(Store.getKnowledge());
    setCompanies(Store.getCompanies());
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsProcessing(true);
    setContent('');

    try {
      const fileExt = file.name.split('.').pop()?.toLowerCase();

      if (fileExt === 'docx') {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        setContent(result.value);
      } 
      else if (fileExt === 'pdf') {
        const arrayBuffer = await file.arrayBuffer();
        // PDF.js carregamento dinâmico do worker se necessário ou via módulo
        const loadingTask = (window as any).pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        let fullText = '';
        
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map((item: any) => item.str).join(' ');
          fullText += pageText + '\n';
        }
        setContent(fullText);
      } 
      else {
        // Fallback para TXT e outros arquivos de texto simples
        const text = await file.text();
        setContent(text);
      }
    } catch (error) {
      console.error("Erro ao processar arquivo:", error);
      alert("Não foi possível extrair o texto deste arquivo. Tente converter para .txt ou .docx");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content) {
      alert("O conteúdo do arquivo ainda não foi processado ou está vazio.");
      return;
    }

    const newItem: KnowledgeItem = {
      id: crypto.randomUUID(),
      name,
      description,
      tags: tags.split(',').map(t => t.trim()).filter(t => t),
      companyId,
      content,
      fileName
    };

    const updated = [newItem, ...items];
    setItems(updated);
    Store.saveKnowledge(updated);
    setIsAdding(false);
    resetForm();
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setTags('');
    setCompanyId('GLOBAL');
    setContent('');
    setFileName('');
  };

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este arquivo?")) {
      const updated = items.filter(i => i.id !== id);
      setItems(updated);
      Store.saveKnowledge(updated);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Base de Conhecimento</h1>
          <p className="text-slate-500 font-medium">Documentos de referência para a IA gerar suas avaliações.</p>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center gap-2"
          >
            <span>➕</span> Novo Documento
          </button>
        )}
      </div>

      {isAdding ? (
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200 animate-in slide-in-from-bottom-4 duration-400">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-black text-slate-800">Upload de Documento</h2>
            <button onClick={() => { setIsAdding(false); resetForm(); }} className="text-slate-400 hover:text-slate-600 font-bold">FECHAR</button>
          </div>
          
          <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="space-y-6">
              <div>
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">Nome Identificador</label>
                <input
                  type="text" required
                  className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 focus:outline-none transition-all font-semibold"
                  value={name} onChange={e => setName(e.target.value)}
                  placeholder="Ex: Código de Ética 2024"
                />
              </div>
              <div>
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">Descrição Curta</label>
                <textarea
                  className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 focus:outline-none transition-all font-medium h-32"
                  value={description} onChange={e => setDescription(e.target.value)}
                  placeholder="Resuma o que este documento aborda..."
                />
              </div>
              <div>
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">Tags (separadas por vírgula)</label>
                <input
                  type="text"
                  className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 focus:outline-none transition-all font-semibold"
                  value={tags} onChange={e => setTags(e.target.value)}
                  placeholder="rh, seguranca, onboarding"
                />
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">Escopo de Uso</label>
                <select
                  className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 focus:outline-none transition-all font-semibold"
                  value={companyId} onChange={e => setCompanyId(e.target.value)}
                >
                  <option value="GLOBAL">Global (Todas as empresas)</option>
                  {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              
              <div>
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">Arquivo (PDF, DOCX, TXT)</label>
                <div className={`relative border-2 border-dashed rounded-[2rem] p-10 text-center transition-all cursor-pointer ${content ? 'border-green-200 bg-green-50' : 'border-slate-200 hover:border-blue-400 hover:bg-slate-50'}`}>
                  <input
                    type="file" accept=".txt,.docx,.pdf"
                    onChange={handleFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <div className="space-y-3">
                    {isProcessing ? (
                      <>
                        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                        <p className="text-sm text-blue-600 font-black">EXTRAINDO TEXTO...</p>
                      </>
                    ) : content ? (
                      <>
                        <span className="text-4xl">✅</span>
                        <p className="text-sm text-green-700 font-black">{fileName}</p>
                        <p className="text-xs text-green-600">Conteúdo extraído com sucesso!</p>
                      </>
                    ) : (
                      <>
                        <span className="text-5xl block mb-2">📁</span>
                        <p className="text-sm text-slate-600 font-bold">
                          Arraste ou clique para selecionar
                        </p>
                        <p className="text-xs text-slate-400">PDF, Word (.docx) ou Texto (.txt)</p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {content && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Prévia do Texto Extraído</p>
                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed italic">
                    "{content.substring(0, 300)}..."
                  </p>
                </div>
              )}
            </div>

            <div className="lg:col-span-2 flex gap-4 pt-6 border-t border-slate-100">
              <button
                type="submit"
                disabled={!content || isProcessing}
                className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-black hover:bg-blue-600 disabled:bg-slate-200 disabled:text-slate-400 transition-all shadow-xl shadow-slate-100"
              >
                SALVAR NA BASE DE CONHECIMENTO
              </button>
              <button
                type="button"
                onClick={() => { setIsAdding(false); resetForm(); }}
                className="px-8 bg-slate-100 text-slate-500 py-4 rounded-2xl font-black hover:bg-slate-200 transition-all"
              >
                CANCELAR
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.length === 0 ? (
            <div className="col-span-full py-32 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
              <span className="text-6xl block mb-6">📚</span>
              <p className="text-slate-500 font-bold text-lg">Sua base de conhecimento está vazia.</p>
              <p className="text-slate-400 text-sm mt-2">Suba manuais e documentos para começar a gerar avaliações.</p>
            </div>
          ) : (
            items.map(item => (
              <div key={item.id} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200 hover:shadow-xl hover:border-blue-200 transition-all duration-300 group">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    {item.fileName.endsWith('.pdf') ? '📕' : item.fileName.endsWith('.docx') ? '📘' : '📄'}
                  </div>
                  <button onClick={() => handleDelete(item.id)} className="text-slate-300 hover:text-red-500 p-2 hover:bg-red-50 rounded-xl transition-all">🗑️</button>
                </div>
                <h3 className="font-black text-xl text-slate-800 mb-2 truncate" title={item.name}>{item.name}</h3>
                <p className="text-sm text-slate-500 mb-6 line-clamp-2 font-medium">{item.description}</p>
                
                <div className="flex flex-wrap gap-2 mb-6">
                  {item.tags.map(tag => (
                    <span key={tag} className="text-[10px] uppercase tracking-wider font-black bg-blue-50 text-blue-600 px-3 py-1 rounded-lg">
                      #{tag}
                    </span>
                  ))}
                </div>
                
                <div className="pt-6 border-t border-slate-50 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Vínculo:</span>
                    <span className="text-[10px] font-bold text-slate-600">
                      {item.companyId === 'GLOBAL' ? 'Global' : companies.find(c => c.id === item.companyId)?.name}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-300">{Math.round(item.content.length / 1000)}kb de texto</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default KnowledgeBase;
