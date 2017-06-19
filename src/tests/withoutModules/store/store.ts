import * as Vuex from "vuex";
import { getStoreAccessors } from "../../../";
import { Product, ProductInBasket, State } from "./state";

type Context = Vuex.ActionContext<State, State>;

const storeOptions = {
    state: {
        basket: {
            items: [],
            totalAmount: 0,
        },

        system: { userLogin:  null },
    },

    getters: {
        getProductNames(state: State) {
            return state.basket.items.map((item) => item.product.name);
        },

        getItemsByStatus(state: State) {
            return (status: boolean) => state.basket.items.filter((item) => item.isSelected === status);
        },

        getTotalAmountWithoutDiscount(state: State) {
            return state.basket.items.reduce((total, item) => total + item.product.unitPrice, 0);
        },
    },

    mutations: {
        reset(state: State) {
            state.basket.items = [];
            state.basket.totalAmount = 0;
        },

        appendItem(state: State, item: { product: Product; atTheEnd: boolean }) {
            state.basket.items.push({ product: item.product, isSelected: false });
        },

        setTotalAmount(state: State, totalAmount: number) {
            state.basket.totalAmount = totalAmount;
        },

        selectProducts(state: State, productNames: string[]) {
            for (const productName of productNames) {
                state.basket.items.find((item) => item.product.name === productName)!.isSelected = true;
            }
        },
    },

    actions: {
        async updateTotalAmount(context: Context, discount: number): Promise<number> {
            const totalBeforeDiscount = readTotalAmountWithoutDiscount(context);

            // Imagine this is a server API call to compute the discounted value:
            await new Promise((resolve, _) => setTimeout(() => resolve(), 500));
            const totalAfterDiscount = totalBeforeDiscount * discount;

            commitSetTotalAmount(context, totalAfterDiscount);

            return totalAfterDiscount;
        },

        async selectAvailableItems(context: Context): Promise<void> {
            // Imagine this is a server API call to figure out which items are available:
            await new Promise((resolve, _) => setTimeout(() => resolve(), 500));

            const availableProductNames = readProductNames(context);
            commitSelectProducts(context, availableProductNames);
        },

        async SelectAvailablieItemsAndUpdateTotalAmount(context: Context, discount: number): Promise<void> {
            await dispatchSelectAvailableItems2(context);
            await dispatchUpdateTotalAmount(context, discount);
        },
    },
};

export const createStore = () => new Vuex.Store<State>(storeOptions);

const { commit, commitNoPayload, read, dispatch, dispatchNoPayload } =
     getStoreAccessors<State, State>("");

const getters = storeOptions.getters;

export const readProductNames = read(getters.getProductNames);
export const readItemsByStatus = read(getters.getItemsByStatus);
export const readTotalAmountWithoutDiscount = read(getters.getTotalAmountWithoutDiscount);

const actions = storeOptions.actions;

export const dispatchUpdateTotalAmount = dispatch(actions.updateTotalAmount);
// Variant 1: simpler but yelding worse API:
export const dispatchSelectAvailableItems = dispatch(actions.selectAvailableItems);
// Variant 2: a bit more complex but yelding better API:
export const dispatchSelectAvailableItems2 = dispatchNoPayload(actions.selectAvailableItems);
export const dispatchSelectAvailablieItemsAndUpdateTotalAmount =
    dispatch(actions.SelectAvailablieItemsAndUpdateTotalAmount);

const mutations = storeOptions.mutations;

// Variant 1: simpler but yelding worse API:
export const commitReset1 = commit(mutations.reset);
// Variant 2: a bit more complex but yelding better API:
export const commitReset2 = commitNoPayload(mutations.reset);
export const commitAppendItem = commit(mutations.appendItem);
export const commitSetTotalAmount = commit(mutations.setTotalAmount);
export const commitSelectProducts = commit(mutations.selectProducts);
