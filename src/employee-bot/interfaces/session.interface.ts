export interface RegistrationSession {
  step: 'name' | 'vacancy' | 'email';
  tgId: number;               // числовой ID
  tgUsername?: string | null; // публичное имя (опционально)
  name?: string;
  vacancy?: string;
  email?: string;
}