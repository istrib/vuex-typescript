import { Module } from "vuex";
import { State as RootState } from "../state";
import { SystemState } from "./systemState";

export const system = {
    namespaced: true,

    state: {
        userLogin: null,
    },
};
