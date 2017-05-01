import { ActionContext } from "vuex";
import { getExportsMakers } from "../../../../";
import { State as RootState } from "../state";
import { BasketState, Product } from "./basketState";

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
        async updateTotalAmount(context: BasketContext, discount: number): Promise<void> {
            const totalBeforeDiscount = readTotalAmountWithoutDiscount(context);

            // Imagine this is a server API call to compute the discounted value:
            await new Promise((resolve, _) => setTimeout(() => resolve(), 500));
            const totalAfterDiscount = totalBeforeDiscount * discount;

            commitSetTotalAmount(context, totalAfterDiscount);
        },

        async selectAvailableItems(context: BasketContext): Promise<void> {
            // Imagine this is a server API call to figure out which items are available:
            await new Promise((resolve, _) => setTimeout(() => resolve(), 500));

            const availableProductNames = readProductNames(context);
            commitSelectProducts(context, availableProductNames);
        },

        async SelectAvailablieItemsAndUpdateTotalAmount(context: BasketContext, discount: number): Promise<void> {
            await dispatchSelectAvailableItems2(context);
            await dispatchUpdateTotalAmount(context, discount);
        },
    },
};

const { makeCommit, makeCommitNoPayload, makeGet, makeDispatch, makeDispatchNoPayload } =
     getExportsMakers<BasketState, RootState>("basket");

const getters = basket.getters;

export const readProductNames = makeGet(getters.getProductNames);
export const readItemsByStatus = makeGet(getters.getItemsByStatus);
export const readTotalAmountWithoutDiscount = makeGet(getters.getTotalAmountWithoutDiscount);

const actions = basket.actions;

export const dispatchUpdateTotalAmount = makeDispatch(actions.updateTotalAmount);
// Variant 1: simpler but yelding worse API:
export const dispatchSelectAvailableItems = makeDispatch(actions.selectAvailableItems);
// Variant 2: a bit more complex but yelding better API:
export const dispatchSelectAvailableItems2 = makeDispatchNoPayload(actions.selectAvailableItems);
export const dispatchSelectAvailablieItemsAndUpdateTotalAmount =
    makeDispatch(actions.SelectAvailablieItemsAndUpdateTotalAmount);

const mutations = basket.mutations;

// Variant 1: simpler but yelding worse API:
export const commitReset1 = makeCommit(mutations.reset);
// Variant 2: a bit more complex but yelding better API:
export const commitReset2 = makeCommitNoPayload(mutations.reset);
export const commitAppendItem = makeCommit(mutations.appendItem);
export const commitSetTotalAmount = makeCommit(mutations.setTotalAmount);
export const commitSelectProducts = makeCommit(mutations.selectProducts);
