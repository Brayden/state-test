import { DurableObject, env } from "cloudflare:workers";
import { DurableObjectRegistry } from "./do-registry";
import { ResourceRegistry, ResourceType } from "./resource-registry";
import { registerAndExport } from "./exports";
import { EnvMap } from "../types";

abstract class StatelessObject<T> {
    constructor() {}

    abstract fetch(request: Request, ctx: ExecutionContext, env: T): Promise<Response>;
}

// Extend StatefulObject to handle initialization
export abstract class ExtendedStatefulObject<E> extends DurableObject<E> {
    protected sql: SqlStorage;

    constructor(ctx: DurableObjectState, env: E) {
        super(ctx, env);
        this.sql = ctx.storage.sql;
    }

    async fetch(request: Request): Promise<Response> {
        throw new Error('fetch() must be implemented in derived class');
    }

    static get get(): DurableObjectNamespace {
        return ResourceRegistry.getDurableObject(this.name);
    }
}

export { ExtendedStatefulObject as StatefulObject, StatelessObject };

export function fetchFromStatefulObject<T>(
    namespace: DurableObjectNamespace,
    name: string = 'default',
    request: Request
): Promise<Response> {
    const stubId = namespace.idFromName(name);
    const stub = namespace.get(stubId);
    return stub.fetch(request);
}

export const entrypoint = (WorkerClass: new () => StatelessObject<any>) => ({
    async fetch(request: Request, env: any, ctx: ExecutionContext): Promise<Response> {
        const worker = new WorkerClass();
        return worker.fetch(request, ctx, env);
    }
}); 