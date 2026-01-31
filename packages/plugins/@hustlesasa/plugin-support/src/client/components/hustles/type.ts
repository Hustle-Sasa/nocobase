// types
export interface DataItem {
  shop_id: number;
  title: string;
  logo: any;
  banner: any[];
  location: any;
  longlat: any;
  apt: any;
  phone: any;
  email: any;
  theme_obj: ThemeObj;
  theme: number;
  delivery: number;
  instagram: any;
  delivery_cost: any;
  facebook: any;
  twitter: any;
  youtube: any;
  tiktok: any;
  public_id: number;
  url: string;
  beta: boolean;
  verified: any;
  settings: string[];
  config: Config;
  account: number;
  status: number;
  online: number;
  short_url: any;
  description: any;
  country: Country;
}

export interface ThemeObj {
  id: number;
  title: string;
  font: string;
  font_color_primary: string;
  font_color_secondary: string;
  button_primary: string;
  button_secondary: string;
  background: string;
}

interface Config {
  terms: string;
  google_tracking: string;
  facebook_tracking: string;
  privacy: string;
}

interface Country {
  id: number;
  name: string;
  alphaCode: string;
  callingCode: number;
  currencyCode: string;
  currencySymbol: string;
  flag: string;
  settings: Settings;
  cities: City[];
  vat_enabled: boolean;
  vat_percentage: number;
}

interface Settings {
  bulk_sms: boolean;
  payment_options: string[];
  checkout_options: CheckoutOption[];
  delivery_options: string[];
  marketplace_events: boolean;
  minimum_withdrawal: number;
  withdrawal_charges: number;
}

export interface CheckoutOption {
  id: number;
  title: string;
  provider: string;
  logo: string;
  code: any;
}

export interface City {
  id: number;
  title: string;
}
