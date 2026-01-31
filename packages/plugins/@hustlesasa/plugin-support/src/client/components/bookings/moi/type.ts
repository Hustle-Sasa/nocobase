export interface Order {
  order_id: number;
  order_ref: string;
  buyer: Buyer;
  hustle: number;
  total: number;
  subtotal: number;
  merchant_tax: number;
  delivery: number;
  discount: number;
  address: any;
  longlat: any;
  currency: string;
  qty: number;
  pay_method: PayMethod;
  ip: string;
  discount_code: any;
  status: Status;
  note: string;
  payment_status: PaymentStatus;
  details: Detail[];
  date: string;
  flags: Flags2;
  store: string;
  store_id: number;
}

export interface Buyer {
  id: number;
  Name: string;
  phone: string;
  email: string;
  address: string;
  location: string;
  apt: string;
  hustle: number;
}

export interface PayMethod {
  id: number;
  title: string;
  provider: string;
  logo: string;
  code: any;
}

export interface Status {
  key: number;
  status: string;
}

export interface PaymentStatus {
  key: number;
  status: string;
}

export interface Detail {
  id: number;
  product: Product;
  price: number;
  variant: Variant2;
  qty: number;
}

export interface Product {
  id: number;
  title: string;
  price: number;
  sale: number;
  status: number;
  images: Image[];
  type: string;
  url: string;
  file: any[];
  event_venue: string;
  ticket_type: string;
  ticket_code: any;
  event_date: string;
  event_time: string;
  event_end_time: string;
  event_end_date: string;
  variant: Variant[];
  flags: Flags;
  group_total: any;
}

export interface Image {
  id: number;
  title: string;
  file: string;
  url: string;
  module: string;
}

export interface Variant {
  id: number;
  title: string;
  stock: number;
  inventory: number;
  price: number;
  product: number;
}

export interface Flags {
  out_of_stock: boolean;
  on_sale: boolean;
  variants: number;
  market_status: number;
}

export interface Variant2 {
  id: number;
  title: string;
  stock: number;
  inventory: number;
  price: number;
  product: number;
}

export interface Flags2 {
  is_marketplace: boolean;
}
