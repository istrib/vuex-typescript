export interface Product {
    id: number;
    name: string;
    unitPrice: number;
}

export interface ProductInBasket {
    product: Product;
    isSelected: boolean;
}

export interface BasketState {
    items: ProductInBasket[];
    totalAmount: number;
}
