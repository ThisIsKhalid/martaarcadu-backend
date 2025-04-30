interface IProduct {
  productId: string;
  quantity: number;
}

export interface IOrder {
  products: IProduct[];
  mobileNumber: string;
  country: string;
  address: string;
  apartment: string;
  city: string;
  state: string;
  zipCode: string;
  paymentMethodId: string;
}
