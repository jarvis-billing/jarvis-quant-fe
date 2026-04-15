export interface Supply {
  id?: string;
  name: string;
  description: string;
  category: string;
  purchaseUnit: string;
  recipeUnit: string;
  conversionFactor: number;
  unitCost: number;
  recipeCost: number;
  stock: number;
  active: boolean;
}

export const MEASUREMENT_UNITS: string[] = [
  'Lata',
  'Bolsa',
  'Kilogramo',
  'Litro',
  'Metro cúbico',
  'Unidad',
  'Viaje'
];

export const SUPPLY_CATEGORIES: string[] = [
  'Arena',
  'Cemento',
  'Agua',
  'Triturado',
  'Aditivo',
  'Mano de Obra',
  'Servicio',
  'Otro'
];
