export interface Purchase {
  id?: string;
  date: Date;
  supplierId: string;
  supplierName: string;
  items: PurchaseItem[];
  subtotal: number;
  tax: number;
  total: number;
  notes: string;
}

export interface PurchaseItem {
  itemType: 'SUPPLY' | 'PRODUCT';
  itemId: string;
  itemName: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}
