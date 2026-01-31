// types
export interface DataItem {
  id: number;
  coupon_code: any;
  coupon_code_id: any;
  affiliate_id: any;
  affiliate_commission: any;
  currency: string;
  sub_total: string;
  service_fee: string;
  address_label: string;
  vat_amount: string;
  vat_percentage: string;
  commission_amount: string;
  commission_percentage: string;
  discount_amount: string;
  delivery_amount: string;
  total_amount: string;
  delivery_address: string;
  delivery_address_apartment_number: string;
  delivery_notes: string;
  status: string;
  hustle_ids: number[];
  hustle_fcm_token: any;
  payment_method_id: string;
  payment_method_name: string;
  payer_phone: string;
  payer_email: string;
  buyer_id: number;
  inventory_reservation_id: string;
  inventory_claimed_at: string;
  customer_id: any;
  created_at: string;
  updated_at: string;
  payment_completed_at: string;
  payment_failed_at: any;
  payment_failed_reason: any;
  payment_transaction_reference: string;
  trace_id: string;
  shipped_at: any;
  delivered_at: string;
  cancelled_at: any;
  order_type: string;
  order_items: OrderItem[];
  buyer: Buyer;
}

export interface OrderItem {
  id: number;
  product_id: string;
  product_name: string;
  product_variant_id: string;
  product_variant_name: string;
  product_type: string;
  product_cover: ProductCover;
  product_banner_assets: ProductBannerAsset[];
  product_variant_banner_assets: any[];
  product_store_id: string;
  product_store_name: string;
  product_account_id: string;
  extra_details: ExtraDetails;
  quantity: number;
  unit_price: string;
  line_total: string;
  order_id: number;
  created_at: string;
  updated_at: string;
}

export interface ProductCover {
  url: string;
  file: string;
  type: string;
}

export interface ProductBannerAsset {
  url: string;
  file: string;
  type: string;
}

export interface ExtraDetails {
  type: string;
  venue: string;
  end_date: string;
  end_time: string;
  start_date: string;
  start_time: string;
  coordinates: string;
  no_per_purchase: number;
  is_complimentary: boolean;
}

export interface Buyer {
  id: number;
  full_name: string;
  phone: string;
  email: string;
  address: any;
  hustle_ids: any[];
  created_at: string;
  updated_at: string;
}
