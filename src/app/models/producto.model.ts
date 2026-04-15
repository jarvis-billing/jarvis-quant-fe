import { RecipeItem } from './receta.model';

export interface Product {
  id?: string;
  name: string;
  description: string;
  type: string;
  heightCm: number;
  lengthCm: number;
  widthCm: number;
  unitsPerBatch: number;
  recipe: RecipeItem[];
  productionCost?: number;
  unitCost?: number;
  stock: number;
  active: boolean;
}

export const PRODUCT_TYPES: string[] = [
  'Bloque hueco',
  'Bloque macizo',
  'Bloque de techo',
  'Adoquín',
  'Bordillo',
  'Otro'
];
