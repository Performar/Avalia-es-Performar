
import { GoogleGenAI, Type } from "@google/genai";
import { Question } from "../types";

export const generateEvaluationQuestions = async (
  theme: string, 
  content: string,
  count: number = 10,
  difficulty: 'Básico' | 'Médio' | 'Avançado' = 'Médio'
): Promise<Question[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
  
  // Limitar conteúdo para evitar estouro de tokens e lentidão, mas manter o contexto
  const safeContent = content.length > 15000 ? content.substring(0, 15000) : content;

  const difficultyInstructions = {
    'Básico': 'Perguntas diretas e literais, focadas na identificação de fatos e conceitos explícitos no texto.',
    'Médio': 'Perguntas que exigem compreensão do contexto, aplicação de conceitos e relação entre diferentes partes do texto.',
    'Avançado': 'Perguntas complexas, situacionais, que exigem análise crítica, inferências lógicas e julgamento baseado no conteúdo.'
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `TEMA DA AVALIAÇÃO: ${theme}\n\nCONTEÚDO DE REFERÊNCIA:\n${safeContent}`,
      config: {
        systemInstruction: `Você é um Professor Corporativo Sênior. Sua tarefa é criar um teste de múltipla escolha com EXATAMENTE ${count} questões baseado no conteúdo fornecido.
        NÍVEL DE DIFICULDADE: ${difficulty}. Instrução de dificuldade: ${difficultyInstructions[difficulty]}
        Regras: 
        1. Cada questão deve ter 5 alternativas (índices 0 a 4). 
        2. Apenas uma alternativa correta. 
        3. Forneça uma justificativa curta para a resposta. 
        4. Use apenas informações presentes no texto. 
        5. Retorne APENAS o JSON no formato definido.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              enunciado: { type: Type.STRING },
              alternativas: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                minItems: 5,
                maxItems: 5
              },
              correta: { type: Type.INTEGER },
              justificativa: { type: Type.STRING }
            },
            required: ["enunciado", "alternativas", "correta", "justificativa"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("A IA retornou uma resposta vazia.");
    
    const data = JSON.parse(text);
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error("Formato de dados inválido retornado pela IA.");
    }

    return data.slice(0, count) as Question[]; 
  } catch (err) {
    console.error("Erro na geração Gemini:", err);
    throw err;
  }
};
