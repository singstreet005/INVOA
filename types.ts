export enum MovementType {
  ENTRY = 'ENTRY',
  EXIT = 'EXIT',
  ADJUSTMENT = 'ADJUSTMENT'
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  category: string;
  currentStock: number;
  minStock: number;
  purchasePrice: number; // Precio Costo
  salePrice: number;     // Precio Venta
  lastUpdated: string;
}

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  type: MovementType;
  quantity: number;
  date: string;
  reason: string;
}

export interface DashboardStats {
  totalProducts: number;
  totalStock: number;
  lowStockCount: number;
  totalValue: number;
}