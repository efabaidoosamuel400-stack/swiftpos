export interface SaleItem {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  costPrice: number;
  lineTotal: number;
}

export interface Sale {
  id: number;
  date: Date;
  items: SaleItem[];
  totalRevenue: number;
  totalCost: number;
  profit: number;
}
