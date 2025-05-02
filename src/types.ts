import { MyStatefulObject } from "./stateful";
import { MyStatelessObject } from "./stateless";

export type Env = {
    MY_STATEFUL_OBJECT: DurableObjectNamespace;
}

export const EnvMap = {
    MY_STATEFUL_OBJECT: MyStatefulObject
}

// Export all objects
export { MyStatefulObject, MyStatelessObject };
