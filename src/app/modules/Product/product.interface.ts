export interface IProduct {
  name: string;
  price: number;
  discount?: number;
  category: string;
  description?: string;
  imageUrl: string;
  isVisible?: boolean; // defaults to true in DB
}
