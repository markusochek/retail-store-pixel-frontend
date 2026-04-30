import { Product } from '@/types/product';

export interface CartItem {
  id: number;
  product_id: number;
  quantity: number;
  created_at: string;
  products: Product;
}
