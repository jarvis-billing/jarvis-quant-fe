export interface Supplier {
  id?: string;
  name: string;
  documentType: string;
  documentNumber: string;
  contactName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  notes: string;
  active: boolean;
}

export const SUPPLIER_DOCUMENT_TYPES: string[] = [
  'NIT',
  'CC',
  'CE',
  'Pasaporte'
];
