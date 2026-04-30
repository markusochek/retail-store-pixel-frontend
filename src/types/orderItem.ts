import { Product } from '@/types/product';

export interface OrderItem {
  products: Product;
  id: number;
  quantity: number;
  price: number;
  created_at: string;
}
