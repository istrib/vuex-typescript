import { expect } from "chai";
import * as Vue from "vue";
import * as Vuex from "vuex";
import { createStore, State } from "./store";
import * as basket from "./store/basket";

describe("Given store with modules exposing mutations", () => {
    let store: Vuex.Store<State>;

    beforeEach(() => {
        Vue.use(Vuex);
        store = createStore();
        store.replaceState({
            system: {
                userLogin: "abc",
            },
            basket: {
                items: [ { product: { id: 1, name: "clock", unitPrice: 50 }, isSelected: true } ],
                totalAmount: 50,
            },
        });
    });

    describe("when parameterless mutation is made in a module using function built with makeCommit function", () => {
        beforeEach(() => {
            basket.commitReset1(store, {});
        });

        it("mutates state of the module and not state of other modules", () => {
            expect(store.state).to.deep.equal({
                system: {
                    userLogin: "abc",
                },
                basket: {
                    items: [],
                    totalAmount: 0,
                },
            });
        });
    });

    describe("when parameterless mutation is made in a module using function built "
        + "with makeCommitNoPayload function", () => {
        beforeEach(() => {
            basket.commitReset2(store);
        });

        it("mutates state of the module and not state of other modules", () => {
            expect(store.state).to.deep.equal({
                system: {
                    userLogin: "abc",
                },
                basket: {
                    items: [],
                    totalAmount: 0,
                },
            });
        });
    });

    describe("when mutation with object as payload is made in a module", () => {
        beforeEach(() => {
            basket.commitAppendItem(store, { product: { id: 2, name: "chair", unitPrice: 20 }, atTheEnd: true });
        });

        it("mutates state of the module and not state of other modules", () => {
            expect(store.state).to.deep.equal({
                system: {
                    userLogin: "abc",
                },
                basket: {
                    items: [
                        { product: { id: 1, name: "clock", unitPrice: 50 }, isSelected: true },
                        { product: { id: 2, name: "chair", unitPrice: 20 }, isSelected: false },
                    ],
                    totalAmount: 50,
                },
            });
        });
    });

    describe("when mutation with value as payload is made in a module", () => {
        beforeEach(() => {
            basket.commitSetTotalAmount(store, 45);
        });

        it("mutates state of the module and not state of other modules", () => {
            expect(store.state).to.deep.equal({
                system: {
                    userLogin: "abc",
                },
                basket: {
                    items: [
                        { product: { id: 1, name: "clock", unitPrice: 50 }, isSelected: true },
                    ],
                    totalAmount: 45,
                },
            });
        });
    });
});
