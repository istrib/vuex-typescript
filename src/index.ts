import { ActionContext, Store } from "vuex";

const useRootNamespace = { root: true };

export function Handler(target: any, key: string) {
    target[key]._vuexKey = key;
}

/*
 * Vuex getter handler with all available parameters as specified in Vuex options
 */
export type GetterHandler<TModuleState, TRootState, TResult> =
    (state: TModuleState, getters: any, rootState: TRootState, rootGetters: any) => TResult;

/**
 * Vuex action handler which takes payload as specified in Vuex options.
 */
export type ActionHandlerWithPayload<TModuleState, TRootState, TPayload, TResult> =
    (injectee: ActionContext<TModuleState, TRootState>, payload: TPayload) => void | Promise<TResult>;
/**
 * Vuex action handler which does not take payload as specified in Vuex options.
 */
export type ActionHandlerNoPayload<TModuleState, TRootState, TResult> =
    (injectee: ActionContext<TModuleState, TRootState>) => void | Promise<TResult>;

/**
 * Vuex mutation handler which takes payload as specified in Vuex options.
 */
export type MutationHandlerWithPayload<TModuleState, TPayload> =
    (state: TModuleState, payload: TPayload) => void;
/**
 * Vuex mutation handler which does not take payload as specified in Vuex options.
 */
export type MutationHandlerNoPayload<TModuleState> =
    (state: TModuleState) => void;

/**
 * Function which gets value of a concrete Vuex getter.
 */
export type GetAccessor<TModuleState, TRootState, TResult> =
    (store: Store<TRootState> | ActionContext<TModuleState, TRootState>) => TResult;

/**
 * Function which dispatches a concrete Vuex action with payload.
 */
export type DispatchAccessorWithPayload<TModuleState, TRootState, TPayload, TResult> =
    (store: Store<TRootState> | ActionContext<TModuleState, TRootState>,
    payload: TPayload) => Promise<TResult>;
/**
 * Function which dispatches a concrete Vuex action without payload.
 */
export type DispatchAccessorNoPayload<TModuleState, TRootState, TResult> =
    (store: Store<TRootState> | ActionContext<TModuleState, TRootState>) => Promise<TResult>;

/**
 * Function which commits a concrete Vuex mutation with payload.
 */
export type CommitAccessorWithPayload<TModuleState, TRootState, TPayload> =
    (store: Store<TRootState> | ActionContext<TModuleState, TRootState>,
    payload: TPayload) => void;
/**
 * Function which commits a concrete Vuex mutation without payload.
 */
export type CommitAccessorNoPayload<TModuleState, TRootState> =
    (store: Store<TRootState> | ActionContext<TModuleState, TRootState>) => void;

export interface StoreAccessors<TModuleState, TRootState> {
    /**
     * Returns a function committing mutations directed to the specified mutation handler.
     * This overload is for handlers which do not expect payload.
     */
    commit(
        handler: MutationHandlerNoPayload<TModuleState>):
            CommitAccessorNoPayload<TModuleState, TRootState>;
    /**
     * Returns a function committing mutations directed to the specified mutation handler.
     * This overload is for handlers which expect payload.
     */
    commit<TPayload>(
        handler: MutationHandlerWithPayload<TModuleState, TPayload>):
            CommitAccessorWithPayload<TModuleState, TRootState, TPayload>;

    /**
     * Returns a function dispatching actions directed to the specified action handler.
     * This overload is for handlers which do not expect payload.
     */
    dispatch<TResult>(
        handler: ActionHandlerNoPayload<TModuleState, TRootState, TResult>):
            DispatchAccessorNoPayload<TModuleState, TRootState, TResult>;
    /**
     * Returns a function dispatching actions directed to the specified action handler.
     * This overload is for handlers which expect payload.
     */
    dispatch<TPayload, TResult>(
        handler: ActionHandlerWithPayload<TModuleState, TRootState, TPayload, TResult>):
            DispatchAccessorWithPayload<TModuleState, TRootState, TPayload, TResult>;

    /**
     * Returns a function returning value of the specified getter.
     */
    read<TResult>(
        handler: GetterHandler<TModuleState, TRootState, TResult>):
            GetAccessor<TModuleState, TRootState, TResult>;
}

export function getStoreAccessors<TModuleState, TRootState>(
    namespace: string): StoreAccessors<TModuleState, TRootState> {
        return {
            commit: (handler: Function) => createAccessor("commit", handler, namespace),
            dispatch: (handler: Function) => createAccessor("dispatch", handler, namespace),
            read: (handler: Function) => {
                const key = qualifyKey(handler, namespace);
                return (store: any) => {
                    return store.rootGetters
                        ? store.rootGetters[key] // ActionContext
                        : store.getters[key]; // Store
                };
            },
        };
}

function createAccessor(
    operation: string,
    handler: Function,
    namespace: string): any {
        const key = qualifyKey(handler, namespace);
        return (store: any, payload: any) => {
            return store[operation](key, payload, useRootNamespace);
        };
}

function qualifyKey(handler: Function, namespace?: string) {
    const key = (<any>handler).name || (<any>handler)._vuexKey;
    if (!key) {
        throw new Error("Vuex handler functions must not be anonymous. "
            + "Vuex needs a key by which it identifies a handler. "
            + "If you define handler as class member you must decorate it with @Handler.");
    }
    return namespace
        ? `${namespace}/${key}`
        : key;
}
