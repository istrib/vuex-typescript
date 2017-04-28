import * as Vuex from "vuex";
import { basket } from "./basket";
import { State } from "./state";
import { system } from "./system";

export const createStore = () => new Vuex.Store<State>({
    modules: {
        basket,
        system,
    },
});
