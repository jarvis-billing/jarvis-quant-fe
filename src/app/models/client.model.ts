export interface Client {
  id?: string;
  name: string;
  documentType: string;
  documentNumber: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  notes: string;
  active: boolean;
}

export const DOCUMENT_TYPES: string[] = [
  'CC',
  'NIT',
  'CE',
  'TI',
  'Pasaporte'
];
