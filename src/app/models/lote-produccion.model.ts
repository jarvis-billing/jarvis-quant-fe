export interface ProductionBatch {
  id?: string;
  productId: string;
  productName: string;
  date: Date;
  cementBags: number;
  unitsProduced: number;
  kgPerBag: number;
  totalCementKg: number;
  productionCost: number;
  unitCost: number;
  qualityStatus: QualityStatus;
  notes: string;
}

export type QualityStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export const QUALITY_STATUSES: QualityStatus[] = ['PENDING', 'APPROVED', 'REJECTED'];
