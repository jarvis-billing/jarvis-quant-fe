import { Supply } from './insumo.model';

export interface RecipeItem {
  id?: string;
  supply: Supply;
  quantity: number;
  totalCost?: number;
}
