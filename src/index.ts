import getParams from "get-params";
import { WatchOptions } from "vue";
import { Action, ActionContext, ActionTree, Commit, CommitOptions,
    Dispatch, DispatchOptions, Getter, GetterTree, install, ModuleTree as VuexModuleTree, Mutation, MutationTree,
    Payload, Plugin, Store as VuexStore } from "vuex";

export { Action, ActionContext, ActionTree, Commit, CommitOptions,
    Dispatch, DispatchOptions, Getter, GetterTree, install, Mutation, MutationTree,
    Payload, Plugin } from "vuex";

export interface GetterService<TState, TRootState> {}
export interface ActionService<TState, TRootState> {}
export interface MutationService<TState> {}

export interface GetterServiceClass<TState, TRootState> {
    new(state: TState, rootState: TRootState): MutationService<TState>;
}

export interface ActionServiceClass<TState, TRootState> {
    new(state: TState, rootState: TRootState): MutationService<TState>;
}

export interface MutationServiceClass<TState> {
    new(state: TState): MutationService<TState>;
}

export interface ModuleTree<TState, TRootState> {
    state: TState;
    getters?: GetterServiceClass<TState, TRootState>[];
    actions?: ActionServiceClass<TState, TRootState>[];
    mutations?: MutationServiceClass<TState>[];
    modules?: Module<any, TRootState>[]
}

export interface Module<TState, TRootState> extends ModuleTree<TState, TRootState> {
    name: string;
}

export interface StoreOptions<TRootState> extends ModuleTree<TRootState, TRootState> {
    plugins?: Array<Plugin<TRootState>>;
    strict?: boolean;
}

export class StoreServices {
    getService<TService>(): TService {
        
    }
}

export class Store<TRootState> extends VuexStore<TRootState> {
    services: StoreServices;
}

export function createStore<TRootState>(options: StoreOptions<TRootState>): Store<TRootState> {
    const store = new Store<TRootState>({
        state: options.state,
        getters: createGetterTarget(options.state, options.state, options.getters),
        actions: createActionTarget(options.state, options.state, options.actions),
        mutations: createMutationTarget(options.state, options.mutations),
        modules: createModules(options.state, options.modules),
        plugins: <any>options.plugins,
        strict: options.strict,
    });

    store.services = proxyServices(store);
}

function createModules<TRootState>(
    rootState: TRootState,
    modules: Array<Module<any, TRootState>> | undefined): VuexModuleTree<TRootState> | undefined {
        if (modules === undefined) {
            return undefined;
        }

        const result: VuexModuleTree<TRootState> = {};
        for (const module of modules) {
            result[module.name] = {
                namespaced: true,
                state: module.state,
                getters: createGetterTarget(module.state, rootState, module.getters),
                actions: createActionTarget(module.state, rootState, module.actions),
                mutations: createMutationTarget(module.state, module.mutations),
                modules: createModules(rootState, module.modules),
            };
        }

        return result;
}

const PROXY = "$proxy";

function getActionProxy<TState, TRootState>(
    actionServiceClass: ActionServiceClass<TState, TRootState>,
    store: Store<TRootState>): ActionService<TState, TRootState> {
        if ((<any>actionServiceClass)[PROXY]) {
            return (<any>actionServiceClass)[PROXY];
        }

        const result: ActionService<TState, TRootState> = {};
        (<any>actionServiceClass)[PROXY] = result;

        for (const memberName in actionServiceClass.prototype) {
            const member = serviceInstance[memberName];
            if (typeof(member) === "function") {
                result[memberName] = compileHandler(serviceInstance, member);
            }
        }
}

function createActionTarget<TState, TRootState>(
    state: TState,
    rootState: TRootState,
    actionServiceClasses: Array<ActionServiceClass<TState, TRootState>> | undefined): ActionTree<TState, TRootState> | undefined {
        if (actionServiceClasses === undefined) {
            return undefined;
        }

        const result: ActionTree<TState, TRootState> = {};
        for (const actionServiceClass of actionServiceClasses) {
            discoverHandlerMethods(actionServiceClass, new actionServiceClass(state, rootState), result);
        }

        return result;
}

function createMutationTarget<TState>(
    state: TState,
    mutationServiceClasses: Array<MutationServiceClass<TState>> | undefined): MutationTree<TState> | undefined {
        if (mutationServiceClasses === undefined) {
            return undefined;
        }

        const result: MutationTree<TState> = {};
        for (const mutationServiceClass of mutationServiceClasses) {
            discoverHandlerMethods(mutationServiceClass, new mutationServiceClass(state), result);
        }

        return result;
}

function discoverHandlerMethods(serviceClass: Function,
    serviceInstance: any, result: { [key: string]: Function; }): void {
        for (const memberName in serviceClass.prototype) {
            const member = serviceInstance[memberName];
            if (typeof(member) === "function") {
                result[memberName] = compileHandler(serviceInstance, member);
            }
        }
}

function createGetterTarget<TState, TRootState>(
    state: TState,
    rootState: TRootState,
    getterServiceClasses: Array<GetterServiceClass<TState, TRootState>> | undefined): GetterTree<TState, TRootState> | undefined {
        if (getterServiceClasses === undefined) {
            return undefined;
        }

        const result: GetterTree<TState, TRootState> = {};
        for (const getterServiceClass of getterServiceClasses) {
            const serviceInstance = new getterServiceClass(state, rootState);
            for (const memberName in getterServiceClass.prototype) {
                const member = (<any>serviceInstance)[memberName];
                if (typeof(member) === "function") {
                    result[memberName] = getParams(member).length === 0
                        ? (<Function>member).bind(serviceInstance)
                        : function() { return (<Function>member).bind(serviceInstance); };
                }
            }
        }

        return result;
}

function compileHandler(serviceInstance: object, serviceClassMember: Function): Function {
    const argNames = getParams(serviceClassMember);
    const noArgs: any[] = [];

    if (argNames.length === 0) {
        return serviceClassMember.bind(serviceInstance);
    } else if (argNames.length === 1) {
        return function(stateOrContext: any, payload: any) {
            return serviceClassMember.call(serviceInstance, payload);
        };
    } else {
        let body = "return serviceClassMember.apply(serviceInstance, [ ";
        for (const argName of argNames) {
            body += `payload["${argName}"], `;
        }
        body += "])";

        return function(stateOrContext: any, payload: any) {
            return new Function("serviceInstance", "serviceClassMember", "payload", body)(
                serviceInstance, serviceClassMember, payload);
        };
    }
}
