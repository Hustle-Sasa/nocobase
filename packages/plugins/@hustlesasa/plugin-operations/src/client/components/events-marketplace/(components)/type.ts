export interface DataItem {
  status: 'requested' | 'approved' | 'rejected';
  id: string;
  approved_to_marketplace: boolean | null;
  product: {
    id: string;
    title: string;
    cover: Image;
    created_at: string;
    description: string;
    banner_assets: Image[];
    is_active: boolean;
    submit_to_marketplace: boolean;
    approved_to_marketplace: boolean | null;
    country: string;
    default_currency: string;
    default_variant: Variant;
    variants: Variant[];
    default_extra_details: ExtraDetails;
    category: { id: string; name: string };
    custom_fields: { [x: string]: any }[];
    related_products: string[];
    hustle: { id: string; name: string };
  };
}

interface Variant {
  selling_price: { [x: string]: number };
  actual_price: { [x: string]: number };
  stock: number;
  available_stock: number;
  actual_stock: number;
  baseline_stock: number;
  description: string;
  title: string;
  is_free: boolean;
  edit: boolean;
  id: string;
  extra_details: ExtraDetails & {
    type: string;
    is_complimentary: boolean;
  };
}

interface ExtraDetails {
  venue: string;
  end_date: string;
  end_time: string;
  timezone: string;
  start_date: string;
  start_time: string;
  coordinates: string;
  no_per_purchase: number;
}

interface Image {
  type: string;
  url: string;
}
