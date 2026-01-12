
import React, { useState } from 'react';
import { Evaluation, User, Submission } from '../types';
import { Store } from '../store';

declare const jspdf: any;

interface TakeEvaluationProps {
  evaluation: Evaluation;
  user: User;
  onFinish: () => void;
}

const TakeEvaluation: React.FC<TakeEvaluationProps> = ({ evaluation, user, onFinish }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<number[]>(new Array(evaluation.questions.length).fill(-1));
  const [isFinished, setIsFinished] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  const currentQuestion = evaluation.questions[currentIdx];

  const handleSelect = (idx: number) => {
    const newAnswers = [...answers];
    newAnswers[currentIdx] = idx;
    setAnswers(newAnswers);
  };

  const next = () => {
    if (currentIdx < evaluation.questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      calculateResult();
    }
  };

  const calculateResult = () => {
    let correct = 0;
    evaluation.questions.forEach((q, i) => {
      if (answers[i] === q.correta) correct++;
    });

    const score = Math.round((correct / evaluation.questions.length) * 100);
    setFinalScore(score);

    const submission: Submission = {
      id: crypto.randomUUID(),
      evaluationId: evaluation.id,
      userId: user.id,
      answers: answers,
      score: score,
      timestamp: Date.now()
    };

    const subs = Store.getSubmissions();
    Store.saveSubmissions([submission, ...subs]);
    setIsFinished(true);
  };

  const generatePDF = () => {
    const { jsPDF } = (window as any).jspdf;
    const doc = new jsPDF();
    const margin = 20;
    let y = 20;

    // Header
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('Relatório de Avaliação', margin, y);
    y += 10;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Avaliação: ${evaluation.title}`, margin, y);
    y += 7;
    doc.text(`Colaborador: ${user.name}`, margin, y);
    y += 7;
    doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, margin, y);
    y += 7;
    doc.setFont('helvetica', 'bold');
    doc.text(`Nota Final: ${finalScore}%`, margin, y);
    y += 15;

    // Questions
    evaluation.questions.forEach((q, idx) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }

      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      const enunciadoLines = doc.splitTextToSize(`${idx + 1}. ${q.enunciado}`, 170);
      doc.text(enunciadoLines, margin, y);
      y += (enunciadoLines.length * 6);

      const userAnswer = answers[idx];
      const isCorrect = userAnswer === q.correta;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      
      const statusText = isCorrect ? '[CORRETA]' : '[INCORRETA]';
      doc.setTextColor(isCorrect ? 0 : 200, isCorrect ? 150 : 0, 0);
      doc.text(`${statusText} Sua resposta: ${String.fromCharCode(65 + userAnswer)}) ${q.alternativas[userAnswer]}`, margin + 5, y);
      y += 6;

      if (!isCorrect) {
        doc.setTextColor(0, 100, 0);
        doc.text(`Resposta correta: ${String.fromCharCode(65 + q.correta)}) ${q.alternativas[q.correta]}`, margin + 5, y);
        y += 6;
      }

      doc.setTextColor(100, 100, 100);
      doc.setFont('helvetica', 'italic');
      const justLines = doc.splitTextToSize(`Justificativa: ${q.justificativa}`, 160);
      doc.text(justLines, margin + 5, y);
      y += (justLines.length * 5) + 5;
      
      doc.setTextColor(0, 0, 0);
    });

    doc.save(`Avaliacao_${evaluation.title.replace(/\s+/g, '_')}.pdf`);
  };

  if (isFinished) {
    const passed = finalScore >= 70;
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden text-center p-12 space-y-8 border border-slate-100">
          <div className="w-24 h-24 mx-auto bg-slate-100 rounded-full flex items-center justify-center text-5xl">
            {passed ? '🏆' : '📚'}
          </div>
          <div>
            <h2 className="text-3xl font-black mb-2">Avaliação Concluída!</h2>
            <p className="text-slate-500 font-medium">Veja seu desempenho detalhado abaixo.</p>
          </div>
          
          <div className="p-10 bg-slate-50 rounded-[2rem] border-2 border-slate-100">
            <div className="flex flex-col items-center">
              <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Nota Final</p>
              <span className={`text-7xl font-black ${passed ? 'text-green-600' : 'text-red-600'}`}>{finalScore}%</span>
              <p className="mt-6 text-slate-700 font-semibold px-4">
                {passed 
                  ? "Parabéns! Seu desempenho foi excelente e você demonstrou domínio sobre o tema." 
                  : "Não foi dessa vez. Recomendamos revisar o material da base de conhecimento e tentar uma nova avaliação futuramente."}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={generatePDF}
              className="w-full bg-blue-600 text-white py-5 rounded-2xl font-bold hover:bg-blue-700 transition-all text-lg shadow-xl shadow-blue-100 flex items-center justify-center gap-2"
            >
              <span>📥</span> Baixar PDF com Gabarito
            </button>
            <button
              onClick={onFinish}
              className="w-full bg-slate-900 text-white py-5 rounded-2xl font-bold hover:bg-slate-800 transition-all text-lg shadow-xl"
            >
              Voltar ao Início
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{evaluation.title}</h2>
          <p className="text-sm text-slate-500">{evaluation.theme}</p>
        </div>
        <div className="text-right">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Questão</span>
          <span className="text-xl font-black text-blue-600">{currentIdx + 1} / {evaluation.questions.length}</span>
        </div>
      </div>

      <div className="h-3 w-full bg-slate-200 rounded-full mb-12 overflow-hidden shadow-inner">
        <div 
          className="h-full bg-blue-500 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${((currentIdx + 1) / evaluation.questions.length) * 100}%` }}
        />
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-xl p-8 md:p-12 border border-slate-100 min-h-[500px] flex flex-col">
        <div className="flex-1 space-y-10">
          <h3 className="text-2xl font-bold text-slate-800 leading-snug">
            {currentQuestion.enunciado}
          </h3>

          <div className="space-y-4">
            {currentQuestion.alternativas.map((alt, idx) => (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                className={`w-full text-left p-6 rounded-2xl border-2 transition-all flex items-center gap-4 group ${
                  answers[currentIdx] === idx 
                    ? 'border-blue-500 bg-blue-50/50 shadow-md ring-2 ring-blue-500 ring-opacity-20' 
                    : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <span className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm transition-colors ${
                  answers[currentIdx] === idx ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'
                }`}>
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className={`flex-1 text-lg font-medium transition-colors ${
                  answers[currentIdx] === idx ? 'text-blue-900' : 'text-slate-600'
                }`}>
                  {alt}
                </span>
                <div className={`w-6 h-6 rounded-full border-2 transition-all flex items-center justify-center ${
                  answers[currentIdx] === idx ? 'border-blue-600' : 'border-slate-200'
                }`}>
                  {answers[currentIdx] === idx && <div className="w-3 h-3 bg-blue-600 rounded-full" />}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-12 pt-8 border-t flex gap-4">
          <button
            disabled={currentIdx === 0}
            onClick={() => setCurrentIdx(currentIdx - 1)}
            className="flex-1 py-4 px-6 rounded-xl font-bold text-slate-400 hover:text-slate-600 hover:bg-slate-50 disabled:opacity-0 transition-all"
          >
            ← Anterior
          </button>
          <button
            disabled={answers[currentIdx] === -1}
            onClick={next}
            className="flex-[2] py-4 px-6 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 transition-all text-lg shadow-xl shadow-slate-200"
          >
            {currentIdx === evaluation.questions.length - 1 ? 'Finalizar Avaliação' : 'Próxima Questão →'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TakeEvaluation;
