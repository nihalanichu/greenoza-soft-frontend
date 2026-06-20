export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'shop';
  shop_id: number | null;
}

export interface Item {
  id: number;
  name: string;
  quantity: number;
  buy_price: number;
  sell_price: number;
  unit: string | null;
  shop_id: number;
}

export interface PurchaseItem {
  item_id: number;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Purchase {
  id: number;
  supplier_name: string;
  purchase_type: 'cash' | 'credit';
  invoice_no: string | null;
  total_amount: number;
  paid_amount: number;
  balance: number;
  items: Array<PurchaseItem & { item: Item }>;
}

export interface Sale {
  id: number;
  customer_name: string | null;
  sale_type: 'cash' | 'credit';
  invoice_no: string | null;
  total_amount: number;
  paid_amount: number;
  balance: number;
  items: Array<PurchaseItem & { item: Item }>;
}

export interface Expense {
  id: number;
  category: string;
  title: string;
  amount: number;
  expense_date: string;
  notes: string | null;
}

export interface Payable {
  id: number;
  supplier_name: string;
  amount_due: number;
  due_date: string | null;
  status: 'pending' | 'paid';
}

export interface Receivable {
  id: number;
  customer_name: string;
  amount_due: number;
  due_date: string | null;
  status: 'pending' | 'paid';
}
