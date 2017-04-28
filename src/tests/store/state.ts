import { BasketState } from "./basket/basketState";
import { SystemState } from "./system/systemState";

export interface State {
    basket: BasketState;
    system: SystemState;
}
