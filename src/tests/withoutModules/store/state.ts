export interface Product {
    id: number;
    name: string;
    unitPrice: number;
}

export interface ProductInBasket {
    product: Product;
    isSelected: boolean;
}

export interface State {
    basket: {
        items: ProductInBasket[];
        totalAmount: number;
    };

    system: { userLogin: string | null };
}
