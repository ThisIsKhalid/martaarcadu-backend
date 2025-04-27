interface IProduct {
  productId: string;
  quantity: number;
}

export interface IOrder {
  orderSN: string;
  userId: string;
  products: IProduct[];
  mobileNumber: string;
  country: string;
  address: string;
  apartment: string;
  city: string;
  state: string;
  zipCode: string;
  paymentMethod: string;
  paymentMethodId: string;
}
