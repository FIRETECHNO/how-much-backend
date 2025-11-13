export interface RegistrationSession {
  step: 'name' | 'vacancy' | 'email';
  name?: string;
  vacancy?: string;
  tgId: number;
  email?: string;
}