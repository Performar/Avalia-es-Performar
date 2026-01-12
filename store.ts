
import { Company, Sector, Role, User, KnowledgeItem, Evaluation, Submission } from './types';
import { MASTER_USER } from './constants';

const KEYS = {
  COMPANIES: 'evalai_companies',
  SECTORS: 'evalai_sectors',
  ROLES: 'evalai_roles',
  USERS: 'evalai_users',
  KNOWLEDGE: 'evalai_knowledge',
  EVALUATIONS: 'evalai_evaluations',
  SUBMISSIONS: 'evalai_submissions',
  AUTH: 'evalai_auth_user'
};

const get = <T,>(key: string, defaultValue: T): T => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultValue;
};

const set = <T,>(key: string, value: T): void => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const Store = {
  getCompanies: () => get<Company[]>(KEYS.COMPANIES, []),
  saveCompanies: (items: Company[]) => set(KEYS.COMPANIES, items),
  
  getSectors: () => get<Sector[]>(KEYS.SECTORS, []),
  saveSectors: (items: Sector[]) => set(KEYS.SECTORS, items),
  
  getRoles: () => get<Role[]>(KEYS.ROLES, []),
  saveRoles: (items: Role[]) => set(KEYS.ROLES, items),
  
  getUsers: () => get<User[]>(KEYS.USERS, []),
  saveUsers: (items: User[]) => set(KEYS.USERS, items),
  
  getKnowledge: () => get<KnowledgeItem[]>(KEYS.KNOWLEDGE, []),
  saveKnowledge: (items: KnowledgeItem[]) => set(KEYS.KNOWLEDGE, items),
  
  getEvaluations: () => get<Evaluation[]>(KEYS.EVALUATIONS, []),
  saveEvaluations: (items: Evaluation[]) => set(KEYS.EVALUATIONS, items),
  
  getSubmissions: () => get<Submission[]>(KEYS.SUBMISSIONS, []),
  saveSubmissions: (items: Submission[]) => set(KEYS.SUBMISSIONS, items),

  getAuth: () => get<User | null>(KEYS.AUTH, null),
  setAuth: (user: User | null) => set(KEYS.AUTH, user),

  // Exportar todo o banco de dados local para uma string JSON
  exportAllData: () => {
    const backup: Record<string, any> = {};
    Object.entries(KEYS).forEach(([keyName, keyValue]) => {
      const data = localStorage.getItem(keyValue);
      if (data) backup[keyValue] = JSON.parse(data);
    });
    return JSON.stringify(backup, null, 2);
  },

  // Importar dados de uma string JSON para o localStorage
  importAllData: (jsonData: string) => {
    try {
      const backup = JSON.parse(jsonData);
      Object.entries(backup).forEach(([key, value]) => {
        localStorage.setItem(key, JSON.stringify(value));
      });
      return true;
    } catch (e) {
      console.error("Erro ao importar dados:", e);
      return false;
    }
  }
};
