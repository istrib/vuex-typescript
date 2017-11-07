import { expect } from "chai";
import * as Vuex from "vuex";
import { createStore, State } from "./store";
import * as api from "./store";

const Vue = require("vue");

describe("Given store without modules exposing mutations", () => {
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

    describe("when parameterless mutation is made using function built with commit function", () => {
        beforeEach(() => {
            api.commitReset(store);
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

    describe("when mutation with object as payload is made", () => {
        beforeEach(() => {
            api.commitAppendItem(store, { product: { id: 2, name: "chair", unitPrice: 20 }, atTheEnd: true });
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

    describe("when mutation with value as payload is made", () => {
        beforeEach(() => {
            api.commitSetTotalAmount(store, 45);
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
