export interface RegistrationSession {
  step: 'name' | 'inn' | 'email';
  tgId: number;
  tgUsername?: string | null;

  name?: string;   // ← ФИО контактного лица
  inn?: string;    // по нему получим companyName из dadata
  email?: string;
}