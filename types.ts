
export type UserRole = 'MASTER_ADMIN' | 'MANAGER' | 'EMPLOYEE';

export interface Company {
  id: string;
  name: string;
}

export interface Sector {
  id: string;
  companyId: string;
  name: string;
}

export interface Role {
  id: string;
  companyId: string;
  name: string;
}

export interface User {
  id: string;
  name: string;
  username: string;
  password?: string;
  role: UserRole;
  companyId?: string;
  sectorId?: string;
  roleId?: string;
}

export interface KnowledgeItem {
  id: string;
  name: string;
  description: string;
  tags: string[];
  companyId: string | 'GLOBAL';
  content: string; // The text content extracted from the file
  fileName: string;
}

export interface Question {
  enunciado: string;
  alternativas: string[];
  correta: number; // Index 0-4
  justificativa: string;
}

export interface Evaluation {
  id: string;
  title: string;
  theme: string;
  knowledgeItemId: string;
  questions: Question[];
  target: {
    companyId?: string;
    sectorId?: string;
    roleId?: string;
  };
  createdAt: number;
  published: boolean;
}

export interface ArrayStats {
  correctCount: number;
  totalCount: number;
  percentage: number;
}

export interface Submission {
  id: string;
  evaluationId: string;
  userId: string;
  answers: number[];
  score: number; // Percent 0-100
  timestamp: number;
}
