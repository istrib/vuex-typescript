import { expect } from "chai";
import * as Vue from "vue";
import * as Vuex from "vuex";
import { createStore, State } from "./store";
import * as basket from "./store/basket";

describe("Given store with modules exposing actions", () => {
    let store: Vuex.Store<State>;

    beforeEach(() => {
        Vue.use(Vuex);
        store = createStore();
        store.replaceState({
            system: {
                userLogin: "abc",
            },
            basket: {
                items: [
                    { product: { id: 1, name: "clock", unitPrice: 50 }, isSelected: true },
                    { product: { id: 2, name: "newspaper", unitPrice: 20 }, isSelected: false },
                    { product: { id: 3, name: "candy", unitPrice: 10 }, isSelected: false },
                ],
                totalAmount: 80,
            },
        });
    });

    describe("when parameterless action is dispatched in a module using function "
        + "built with dispatch function", () => {

        beforeEach(async () => {
            await basket.dispatchSelectAvailableItems(store, {});
        });

        it("mutates state of the module via mutations invoked within the action", () => {
            expect(store.state).to.deep.equal({
                system: {
                    userLogin: "abc",
                },
                basket: {
                    items: [
                        { product: { id: 1, name: "clock", unitPrice: 50 }, isSelected: true },
                        { product: { id: 2, name: "newspaper", unitPrice: 20 }, isSelected: true },
                        { product: { id: 3, name: "candy", unitPrice: 10 }, isSelected: true },
                    ],
                    totalAmount: 80,
                },
            });
        });
    });

    describe("when parameterless action is dispatched in a module using function "
        + "built with dispatchNoPayload function", () => {

        beforeEach(async () => {
            await basket.dispatchSelectAvailableItems2(store);
        });

        it("mutates state of the module via mutations invoked within the action", () => {
            expect(store.state).to.deep.equal({
                system: {
                    userLogin: "abc",
                },
                basket: {
                    items: [
                        { product: { id: 1, name: "clock", unitPrice: 50 }, isSelected: true },
                        { product: { id: 2, name: "newspaper", unitPrice: 20 }, isSelected: true },
                        { product: { id: 3, name: "candy", unitPrice: 10 }, isSelected: true },
                    ],
                    totalAmount: 80,
                },
            });
        });
    });

    describe("when action with object as payload is dispatched in a module", () => {
        beforeEach(async () => {
            await basket.dispatchUpdateTotalAmount(store, 0.5);
        });

        it("mutates state of the module via mutations invoked within the action", () => {
            expect(store.state).to.deep.equal({
                system: {
                    userLogin: "abc",
                },
                basket: {
                    items: [
                        { product: { id: 1, name: "clock", unitPrice: 50 }, isSelected: true },
                        { product: { id: 2, name: "newspaper", unitPrice: 20 }, isSelected: false },
                        { product: { id: 3, name: "candy", unitPrice: 10 }, isSelected: false },
                    ],
                    totalAmount: 40,
                },
            });
        });
    });

    describe("when action returning promise which resolves to non-void value is dispatched in a module", () => {
        let actualResult: number;

        beforeEach(async () => {
            actualResult = await basket.dispatchUpdateTotalAmount(store, 0.5);
        });

        it("returns promise which resolves to the same value", () => {
            expect(actualResult).to.equal(40);
        });
    });

    describe("when action which delegates work to other actions is dispatched in a module ", () => {
        beforeEach(async () => {
            await basket.dispatchSelectAvailablieItemsAndUpdateTotalAmount(store, 0.5);
        });

        it("mutates state of the module via mutations invoked within the delegated action", () => {
            expect(store.state).to.deep.equal({
                system: {
                    userLogin: "abc",
                },
                basket: {
                    items: [
                        { product: { id: 1, name: "clock", unitPrice: 50 }, isSelected: true },
                        { product: { id: 2, name: "newspaper", unitPrice: 20 }, isSelected: true },
                        { product: { id: 3, name: "candy", unitPrice: 10 }, isSelected: true },
                    ],
                    totalAmount: 40,
                },
            });
        });
    });
});
