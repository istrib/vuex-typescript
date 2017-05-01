import { ActionContext, Store } from "vuex";

const useRootNamespace = { root: true };

export function handler(target: any, key: string) {
    target[key]._vuexKey = key;
}

export type MutationHandler<TModuleState, TPayload> =
    (state: TModuleState, payload: TPayload) => void;
export type PayloadlessMutationHandler<TModuleState> =
    (state: TModuleState) => void;

export type ActionHandler<TModuleState, TRootState, TPayload> =
    (injectee: ActionContext<TModuleState, TRootState>, payload: TPayload) => void | Promise<any>;
export type PayloadlessActionHandler<TModuleState, TRootState> =
    (injectee: ActionContext<TModuleState, TRootState>) => void | Promise<any>;

export type GetterHandler<TModuleState, TRootState, TResult> =
    (state: TModuleState, rootState: TRootState) => TResult;

export type GetIssuer<TModuleState, TRootState, TResult> =
    (store: Store<TRootState> | ActionContext<TModuleState, TRootState>) => TResult;

export type DispatchIssuer<TModuleState, TRootState, TPayload> =
    (store: Store<TRootState> | ActionContext<TModuleState, TRootState>,
    payload: TPayload) => Promise<any[]>;
export type PayloadlessDispatchIssuer<TModuleState, TRootState> =
    (store: Store<TRootState> | ActionContext<TModuleState, TRootState>) => Promise<any[]>;

export type CommitIssuer<TModuleState, TRootState, TPayload> =
    (store: Store<TRootState> | ActionContext<TModuleState, TRootState>,
    payload: TPayload) => void;
export type PayloadlessCommitIssuer<TModuleState, TRootState> =
    (store: Store<TRootState> | ActionContext<TModuleState, TRootState>) => void;

export interface FunctionMakers<TModuleState, TRootState> {
    makeCommit<TPayload>(
        handler: MutationHandler<TModuleState, TPayload>): CommitIssuer<TModuleState, TRootState, TPayload>;
    makeCommitNoPayload(
        handler: PayloadlessMutationHandler<TModuleState>): PayloadlessCommitIssuer<TModuleState, TRootState>;

    makeDispatch<TPayload>(
        handler: ActionHandler<TModuleState, TRootState, TPayload>): DispatchIssuer<TModuleState, TRootState, TPayload>;
    makeDispatchNoPayload(
        handler: PayloadlessActionHandler<TModuleState, TRootState>):
        PayloadlessDispatchIssuer<TModuleState, TRootState>;

    makeGet<TResult>(
        handler: GetterHandler<TModuleState, TRootState, TResult>): GetIssuer<TModuleState, TRootState, TResult>;
}

export function getExportsMakers<TModuleState, TRootState>(
    namespace: string): FunctionMakers<TModuleState, TRootState> {
        return {
            makeCommit: <TPayload>(handler: MutationHandler<TModuleState, TPayload>) =>
                makeCommit(handler, namespace),
            makeCommitNoPayload: (handler: PayloadlessMutationHandler<TModuleState>) =>
                makeCommitNoPayload(handler, namespace),

            makeDispatch: <TPayload>(handler: ActionHandler<TModuleState, TRootState, TPayload>) =>
                makeDispatch(handler, namespace),
            makeDispatchNoPayload: (handler: PayloadlessActionHandler<TModuleState, TRootState>) =>
                makeDispatchNoPayload(handler, namespace),
            makeGet: <TResult>(handler: GetterHandler<TModuleState, TRootState, TResult>) =>
                makeGet(handler, namespace),
        };
}

function makeGet<TModuleState, TRootState, TResult>(
    handler: GetterHandler<TModuleState, TRootState, TResult>,
    namespace: string): GetIssuer<TModuleState, TRootState, TResult> {
        const key = qualifyKey(handler, namespace);
        return (store: any) => {
            return store.rootGetters
                ? <TResult>store.rootGetters[key] // ActionContext
                : <TResult>store.getters[key]; // Store
        };
    }

function makeDispatch<TModuleState, TRootState, TPayload>(
    handler: ActionHandler<TModuleState, TRootState, TPayload>,
    namespace: string): DispatchIssuer<TModuleState, TRootState, TPayload> {
        const key = qualifyKey(handler, namespace);
        return (store, payload) => {
            return store.dispatch(key, payload, useRootNamespace);
        };
}

function makeDispatchNoPayload<TModuleState, TRootState>(
    handler: PayloadlessActionHandler<TModuleState, TRootState>,
    namespace: string): PayloadlessDispatchIssuer<TModuleState, TRootState> {
        const key = qualifyKey(handler, namespace);
        return (store) => {
            return store.dispatch(key, undefined, useRootNamespace);
        };
}

function makeCommit<TModuleState, TRootState, TPayload>(
    handler: MutationHandler<TModuleState, TPayload>,
    namespace: string): CommitIssuer<TModuleState, TRootState, TPayload> {
        const key = qualifyKey(handler, namespace);
        return (store, payload) => {
            store.commit(key, payload, useRootNamespace);
        };
}

function makeCommitNoPayload<TModuleState, TRootState>(
    handler: PayloadlessMutationHandler<TModuleState>,
    namespace: string): PayloadlessCommitIssuer<TModuleState, TRootState> {
        const key = qualifyKey(handler, namespace);
        return (store) => {
            store.commit(key, undefined, useRootNamespace);
        };
}

function qualifyKey(handler: Function, namespace?: string) {
    const key = (<any>handler).name || (<any>handler)._vuexKey;
    if (!key) {
        throw new Error("Vuex handler functions must not be anonymous. "
            + "Vuex needs a key by which it identifies a handler. "
            + "If you define handler as class member you must decorate it with @handler.");
    }
    return namespace
        ? `${namespace}/${key}`
        : key;
}
