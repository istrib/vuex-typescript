import { ActionContext, Store } from "vuex";
import { getStoreAccessors } from "../../../../";
import { State as RootState } from "../state";
import { BasketState, Product, ProductInBasket } from "./basketState";

type BasketContext = ActionContext<BasketState, RootState>;

export const basket = {
    namespaced: true,

    state: {
        items: [],
        totalAmount: 0,
    },

    getters: {
        getProductNames(state: BasketState) {
            return state.items.map((item) => item.product.name);
        },

        getItemsByStatus(state: BasketState) {
            return (status: boolean) => state.items.filter((item) => item.isSelected === status);
        },

        getTotalAmountWithoutDiscount(state: BasketState) {
            return state.items.reduce((total, item) => total + item.product.unitPrice, 0);
        },
    },

    mutations: {
        reset(state: BasketState) {
            state.items = [];
            state.totalAmount = 0;
        },

        appendItem(state: BasketState, item: { product: Product; atTheEnd: boolean }) {
            state.items.push({ product: item.product, isSelected: false });
        },

        setTotalAmount(state: BasketState, totalAmount: number) {
            state.totalAmount = totalAmount;
        },

        selectProducts(state: BasketState, productNames: string[]) {
            for (const productName of productNames) {
                state.items.find((item) => item.product.name === productName)!.isSelected = true;
            }
        },
    },

    actions: {
        async updateTotalAmount(context: BasketContext, discount: number): Promise<number> {
            const totalBeforeDiscount = readTotalAmountWithoutDiscount(context);

            // Imagine this is a server API call to compute the discounted value:
            await new Promise((resolve, _) => setTimeout(() => resolve(), 500));
            const totalAfterDiscount = totalBeforeDiscount * discount;

            commitSetTotalAmount(context, totalAfterDiscount);

            return totalAfterDiscount;
        },

        async selectAvailableItems(context: BasketContext): Promise<void> {
            // Imagine this is a server API call to figure out which items are available:
            await new Promise((resolve, _) => setTimeout(() => resolve(), 500));

            const availableProductNames = readProductNames(context);
            commitSelectProducts(context, availableProductNames);
        },

        async SelectAvailablieItemsAndUpdateTotalAmount(context: BasketContext, discount: number): Promise<void> {
            await dispatchSelectAvailableItems(context);
            await dispatchUpdateTotalAmount(context, discount);
        },
    },
};

const { commit, read, dispatch } =
     getStoreAccessors<BasketState, RootState>("basket");

const getters = basket.getters;

export const readProductNames = read(getters.getProductNames);
export const readItemsByStatus = read(getters.getItemsByStatus);
export const readTotalAmountWithoutDiscount = read(getters.getTotalAmountWithoutDiscount);

const actions = basket.actions;

export const dispatchUpdateTotalAmount = dispatch(actions.updateTotalAmount);
export const dispatchSelectAvailableItems = dispatch(actions.selectAvailableItems);
export const dispatchSelectAvailablieItemsAndUpdateTotalAmount =
    dispatch(actions.SelectAvailablieItemsAndUpdateTotalAmount);

const mutations = basket.mutations;

export const commitReset = commit(mutations.reset);
export const commitAppendItem = commit(mutations.appendItem);
export const commitSetTotalAmount = commit(mutations.setTotalAmount);
export const commitSelectProducts = commit(mutations.selectProducts);
