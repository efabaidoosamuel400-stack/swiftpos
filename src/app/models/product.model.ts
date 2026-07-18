export interface Product {
  id: number;
  name: string;
  sellingPrice: number;
  costPrice: number;
  stock: number;
  category?: string;
  image?: string;
}
