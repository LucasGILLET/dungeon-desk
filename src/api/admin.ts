import { authenticatedFetch, buildApiUrl } from '@/utils/api';

// Back-office des données de jeu (routes /api/admin du backend)

export type AdminRole = 'USER' | 'TRANSLATOR' | 'EDITOR' | 'ADMIN';
export type Texts = Record<string, Record<string, string | null>>;

export const EDITION = '2014';
export const LOCALES = [
  { code: 'en', label: 'Anglais (référence)' },
  { code: 'fr', label: 'Français' },
] as const;

export interface AdminMe {
  id: number;
  email: string;
  username: string | null;
  role: AdminRole;
}

export interface AdminClassSummary {
  index: string;
  hitDie: number;
  subclassLevel: number;
  names: Record<string, string>;
  translationsTodo: number;
}

export interface AdminFeature {
  id: number;
  index: string;
  level: number;
  subclass: string | null;
  translations: Texts;
}

export interface AdminClass {
  id: number;
  index: string;
  hitDie: number;
  subclassLevel: number;
  source: string;
  translations: Texts;
  subclasses: { id: number; index: string; translations: Texts }[];
  features: AdminFeature[];
}

export interface ClassUpdate {
  hitDie?: number;
  subclassLevel?: number;
  translations?: Texts;
  features?: { id: number; translations: Texts }[];
}

export type TranslatableEntity = 'class' | 'subclass' | 'classFeature' | 'choice' | 'spellcastingSection' | 'classTableColumn';

export interface TodoItem {
  entity: TranslatableEntity;
  id: number;
  classIndex: string;
  context: string;
  reference: Record<string, string | null>;
  translation: Record<string, string | null> | null;
  status: 'missing' | 'identical' | 'ok';
}

export interface TodoList {
  locale: string;
  total: number;
  todo: number;
  items: TodoItem[];
}

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly body: unknown,
  ) {
    super(`Erreur ${status}`);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await authenticatedFetch(buildApiUrl(path), init);
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(res.status, body);
  return body as T;
}

export const adminApi = {
  me: () => request<AdminMe>('admin/me'),
  classes: () => request<AdminClassSummary[]>(`admin/${EDITION}/classes`),
  getClass: (index: string) => request<AdminClass>(`admin/${EDITION}/classes/${index}`),
  saveClass: (index: string, update: ClassUpdate) =>
    request<AdminClass>(`admin/${EDITION}/classes/${index}`, { method: 'PUT', body: JSON.stringify(update) }),
  translationsTodo: (locale = 'fr') => request<TodoList>(`admin/${EDITION}/translations?locale=${locale}`),
  saveTranslation: (entity: TranslatableEntity, id: number, locale: string, data: Record<string, string | null>) =>
    request(`admin/translations/${entity}/${id}/${locale}`, { method: 'PUT', body: JSON.stringify(data) }),
};

export const canEditContent = (role?: AdminRole) => role === 'EDITOR' || role === 'ADMIN';
export const canOpenBackOffice = (role?: AdminRole) => role === 'TRANSLATOR' || canEditContent(role);

// Libellés des champs traduisibles
export const FIELD_LABELS: Record<string, string> = {
  name: 'Nom',
  subclassLabel: 'Nom générique des sous-classes',
  description: 'Description',
  title: 'Titre',
  label: 'Libellé',
};

// Champs longs (zone de texte) et obligatoires, par entité
export const ENTITY_FIELDS: Record<TranslatableEntity, { field: string; multiline?: boolean; required?: boolean }[]> = {
  class: [{ field: 'name', required: true }, { field: 'subclassLabel', required: true }, { field: 'description', multiline: true }],
  subclass: [{ field: 'name', required: true }, { field: 'description', multiline: true }],
  classFeature: [{ field: 'name', required: true }, { field: 'description', multiline: true, required: true }],
  choice: [{ field: 'description', multiline: true, required: true }],
  spellcastingSection: [{ field: 'title', required: true }, { field: 'description', multiline: true, required: true }],
  classTableColumn: [{ field: 'label', required: true }],
};
