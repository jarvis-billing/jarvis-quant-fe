export interface Sale {
  id?: string;
  date: Date;
  clientId: string;
  clientName: string;
  items: SaleItem[];
  itemsSubtotal: number;
  transportCost: number;
  total: number;
  notes: string;
}

export interface SaleItem {
  id?: string;
  itemType: 'PRODUCT' | 'SUPPLY';
  itemId: string;
  itemName: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}
