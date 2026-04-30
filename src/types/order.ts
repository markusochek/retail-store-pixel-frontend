import { User } from '@/types/user';
import { OrderItem } from '@/types/orderItem';
import { OrderStatus } from '@/types/orderStatus';

export interface Order {
  id: number;
  total_amount: number;
  order_number: string;
  notes: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  customer_name: string | null;
  pickup_code: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  ready_at: string | null;
  assembled_at: string | null;
  order_items: OrderItem[];
  order_statuses: OrderStatus;
  users: User;
}
