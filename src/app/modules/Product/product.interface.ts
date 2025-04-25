export interface IProduct {
  id?: string;
  name: string;
  price: number;
  discount?: number;
  category: string;
  description?: string;
  imageUrl: string;
  isVisible?: boolean; // defaults to true in DB
  totalSell?: number; // defaults to 0 in DB
}
