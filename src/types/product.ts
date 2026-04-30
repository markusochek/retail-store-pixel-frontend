import { Favorite } from '@/types/favorite';

export interface Product {
  id: number;
  name: string;
  sale_price: number;
  quantity: number;
  favorites?: Favorite[];
  images: { id: number; path_to_image: string; product_id: number }[];
}

export interface ProductWithIsFavorite extends Product {
  isFavorite: boolean;
}
