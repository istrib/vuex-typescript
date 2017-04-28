import { getExportsMakers } from "../../../";
import { State as RootState } from "../state";
import { BasketState, Product } from "./basketState";

export const basket = {
    namespaced: true,

    state: {
        items: [],
        totalAmount: 0,
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
    },
};


const { makeCommit, makeCommitNoPayload } = getExportsMakers<BasketState, RootState>("basket");
const mutations = basket.mutations;

// Variant 1: simpler but yelding worse API:
export const commitReset1 = makeCommit(mutations.reset);
// Variant 2: a bit more complex but yelding better API:
export const commitReset2 = makeCommitNoPayload(mutations.reset);

export const commitAppendItem = makeCommit(mutations.appendItem);
export const commitSetTotalAmount = makeCommit(mutations.setTotalAmount);
