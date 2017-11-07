import { expect } from "chai";
import * as Vuex from "vuex";
import { getStoreAccessors, StoreAccessors } from "../../";
import { createStore, State } from "./store";
import * as system from "./store/system";

const Vue = require("vue");

class WrongSystemModuleHandlers {
    public setUserLoginUndecorated(state: system.SystemState, login: string) {
        state.userLogin = login;
    }
}

describe("Given mutations defined as class members", () => {
    let store: Vuex.Store<State>;

    beforeEach(() => {
        Vue.use(Vuex);
        store = createStore();
        store.replaceState({
            system: {
                userLogin: "abc",
            },
            basket: {
                items: [],
                totalAmount: 0,
            },
        });
    });

    describe("when mutation is made using function built with commit "
        + "function applied to class method decorated with @Handler decorator", () => {
        beforeEach(() => {
            system.commitSetUserLogin(store, "xyz");
        });

        it("mutates state", () => {
            expect(store.state).to.deep.equal({
                system: {
                    userLogin: "xyz",
                },
                basket: {
                    items: [],
                    totalAmount: 0,
                },
            });
        });
    });

    describe("when commit function is applied to class method which is not decorated with @Handler decorator", () => {
        let storeAccessors: StoreAccessors<system.SystemState, State>;

        beforeEach(() => {
            storeAccessors = getStoreAccessors<system.SystemState, State>("system");
        });

        it("throws 'Vuex handler functions must not be anonymous...' error", () => {
            expect(() => storeAccessors.commit(new WrongSystemModuleHandlers().setUserLoginUndecorated))
                .to.throw(Error, "Vuex handler functions must not be anonymous. "
                    + "Vuex needs a key by which it identifies a handler. "
                    + "If you define handler as class member you must decorate it with @Handler.");
        });
    });
});
