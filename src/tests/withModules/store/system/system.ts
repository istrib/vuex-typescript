import { ActionContext, Store } from "vuex";
import { getStoreAccessors, Handler } from "../../../../";
import { State as RootState } from "../state";
import { SystemState } from "./systemState";

// The pattern shown here IS NOT RECOMMENDED.
// This is purely to verify that using class methods as vuex handlers
// (as implemented with e.g. https://www.npmjs.com/package/vuex-class-module) is possible
// provided use of @Handler decorator:

export class SystemModuleHandlers {
    @Handler
    public setUserLogin(state: SystemState, login: string) {
        state.userLogin = login;
    }
}

export const systemModuleHandlers = new SystemModuleHandlers();

export const system = {
    namespaced: true,

    state: {
        userLogin: null,
    },

    mutations: {
        setUserLogin: systemModuleHandlers.setUserLogin,
    },
};

const { commit } =
     getStoreAccessors<SystemState, RootState>("system");

export const commitSetUserLogin = commit(systemModuleHandlers.setUserLogin);
