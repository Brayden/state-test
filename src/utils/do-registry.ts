import { DurableObject } from "cloudflare:workers";

type DurableObjectConstructor<T> = abstract new(state: DurableObjectState, env: T) => DurableObject;

export class DurableObjectRegistry {
    private static instances = new Map<string, DurableObjectNamespace>();

    static register(name: string, namespace: DurableObjectNamespace) {
        this.instances.set(name, namespace);
    }

    static get<T>(objectClass: DurableObjectConstructor<T>): DurableObjectNamespace {
        const name = objectClass.name;
        const namespace = this.instances.get(name);
        if (!namespace) {
            throw new Error(`Durable Object ${name} not registered. Ensure it's properly bound in wrangler.jsonc`);
        }
        return namespace;
    }
} 