import { DurableObject } from "cloudflare:workers";
import { ResourceRegistry, ResourceType } from "./resource-registry";
import { registerAndExport } from "./exports";
import { EnvMap } from "../types";
import { StatelessObject } from "./do-utils";

type ExportedHandler<E> = {
    fetch(request: Request, env: E, ctx: ExecutionContext): Promise<Response>;
};

// Create a variable to hold the worker export
let workerExport: ExportedHandler<any> = {
    async fetch(request: Request, env: any, ctx: ExecutionContext): Promise<Response> {
        return new Response("Worker not initialized", { status: 500 });
    }
};

// Default implementation of namespace
function defaultNamespace(request: Request): string {
    return new URL(request.url).pathname;
}

// export function entrypoint<E>(
//     ObjectClass: (
//         { new(): { fetch(request: Request, ctx: ExecutionContext, env: E): Promise<Response> } } |
//         { new(state: DurableObjectState, env: E): DurableObject<E> }
//     )
// ) {
//     // If it's a Durable Object (has idFromRequest or needs one), set up the worker functionality
//     if ((ObjectClass as any).idFromRequest || ObjectClass.prototype instanceof DurableObject) {
//         // Add default namespace if needed
//         if (!(ObjectClass as any).idFromRequest) {
//             (ObjectClass as any).idFromRequest = defaultNamespace;
//         }

//         // Create worker handler
//         workerExport = {
//             async fetch(request: Request, env: E, ctx: ExecutionContext): Promise<Response> {
//                 const namespace = Object.values(env)[0] as DurableObjectNamespace;
//                 const idString = (ObjectClass as any).idFromRequest(request);
//                 const id = namespace.idFromName(idString);
//                 const stub = namespace.get(id);
//                 return stub.fetch(request);
//             }
//         };
//     }

//     // Return the entrypoint handler
//     return {
//         async fetch(request: Request, env: E, ctx: ExecutionContext): Promise<Response> {
//             // Register resources first
//             registerAndExport(env, EnvMap);

//             // Then handle based on type
//             if ((ObjectClass as any).idFromRequest || ObjectClass.prototype instanceof DurableObject) {
//                 return workerExport.fetch(request, env, ctx);
//             } else {
//                 const statelessInstance = new (ObjectClass as new () => StatelessObject<E>)();
//                 return statelessInstance.fetch(request, ctx, env);
//             }
//         }
//     };
// }

type RequestHandler<E> = (request: Request, env?: E, ctx?: ExecutionContext) => Promise<Response> | Response;

type EntrypointInput<E> = 
    | { new(): { fetch(request: Request, ctx: ExecutionContext, env: E): Promise<Response> } }
    | { new(state: DurableObjectState, env: E): DurableObject<E> }
    | RequestHandler<E>;

export function entrypoint<E>(input: EntrypointInput<E>) {
    // If input is a plain function (not a class), wrap it in a simple handler
    if (typeof input === 'function' && !input.prototype) {
        return {
            async fetch(request: Request, env: E, ctx: ExecutionContext): Promise<Response> {
                // Register resources first
                registerAndExport(env, EnvMap);
                
                // Call the handler function with all parameters
                const handler = input as RequestHandler<E>;
                const result = await handler(request, env, ctx);
                return result;
            }
        };
    }

    // Handle existing StatelessObject and DurableObject cases
    const ObjectClass = input as (new () => any);
    
    if ((ObjectClass as any).idFromRequest || ObjectClass.prototype instanceof DurableObject) {
        // Existing Durable Object logic
        if (!(ObjectClass as any).idFromRequest) {
            (ObjectClass as any).idFromRequest = defaultNamespace;
        }

        workerExport = {
            async fetch(request: Request, env: E, ctx: ExecutionContext): Promise<Response> {
                const namespace = Object.values(env)[0] as DurableObjectNamespace;
                const idString = (ObjectClass as any).idFromRequest(request);
                const id = namespace.idFromName(idString);
                const stub = namespace.get(id);
                return stub.fetch(request);
            }
        };
    }

    return {
        async fetch(request: Request, env: E, ctx: ExecutionContext): Promise<Response> {
            // Register resources first
            registerAndExport(env, EnvMap);

            // Then handle based on type
            if ((ObjectClass as any).idFromRequest || ObjectClass.prototype instanceof DurableObject) {
                return workerExport.fetch(request, env, ctx);
            } else {
                const statelessInstance = new (ObjectClass as new () => StatelessObject<E>)();
                return statelessInstance.fetch(request, ctx, env);
            }
        }
    };
}