import { ResourceRegistry, ResourceType } from "./resource-registry";
import { Env } from "../types";

type ExportableObject = 
    | { new(state: DurableObjectState, env: any): any }
    | { new(): any }
    | (new (ctx: DurableObjectState, env: any) => DurableObject);

type BindingMap = {
    [envKey: string]: ExportableObject;
};

export function registerAndExport(env: any, bindings?: BindingMap) {
    if (!env || !bindings) return {};
    
    const exports: Record<string, any> = {};
    
    for (const [envKey, ClassObj] of Object.entries(bindings)) {
        if (!ClassObj || typeof ClassObj !== 'function') continue;
        
        exports[envKey] = ClassObj;
        if (env[envKey]) {
            // Register with both the env key and class name
            ResourceRegistry.register(envKey, env[envKey] as ResourceType);
            ResourceRegistry.register(ClassObj.name, env[envKey] as ResourceType);
        }
    }
    
    return exports;
}
