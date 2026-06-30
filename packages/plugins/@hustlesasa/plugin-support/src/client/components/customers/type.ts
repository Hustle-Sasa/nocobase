export interface CustomerAddress {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
}

export interface Customer {
  id: string;
  fullname: string;
  email: string;
  phone: string;
  address?: CustomerAddress;
  app_downloaded: boolean;
  buyer_app_activated: boolean;
}
