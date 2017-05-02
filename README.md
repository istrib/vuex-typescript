# Vuex-Typescript

A simple way to get static typing, static code analysis and intellisense with Vuex library.

![](doc/Intellisense.png)

Example (full working example available [here](src/tests/withModules/store/basket/basket.ts)):

```js
import { ActionContext, Store } from "vuex";
import { getStoreAccessors } from "vuex-typescript";
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
		...
    },

    mutations: {
        appendItem(state: BasketState, item: { product: Product; atTheEnd: boolean }) {
            state.items.push({ product: item.product, isSelected: false });
        },
		...
    },

    actions: {
        async updateTotalAmount(context: BasketContext, discount: number): Promise<void> {
            const totalBeforeDiscount = readTotalAmountWithoutDiscount(context);
            const totalAfterDiscount = await callServer(totalBeforeDiscount, discount);
            commitSetTotalAmount(context, totalAfterDiscount);
        },
		...
    },
};

// This is where the vuex-typescript specific stuff begins:
//
// We want to expose static functions which will call get, dispatch or commit method
// on a store instance taking correct type of payload (or getter signature).
// Instead of writing these "store accessor" functions by hand, we use set of higher-order
// functions provided by vuex-typescript. These functions will produce statically typed
// functions which we want. Note that no type annotation is required at this point.
// Types of arguments are inferred from signature of vanilla vuex handlers defined above:

const { commit, read, dispatch } =
     getStoreAccessors<BasketState, RootState>("basket");

export const readProductNames = read(basket.getters.getProductNames);
export const dispatchUpdateTotalAmount = dispatch(basket.actions.updateTotalAmount);
export const commitAppendItem = commit(basket.mutations.appendItem);

```

## Contributing

```
npm run build
npm run build-watch

npm test
npm run test-watch
npm run test-debug
npm run coverage
```
