import { DurableObject } from "cloudflare:workers";

export type ResourceType = 
  | DurableObjectNamespace 
  | KVNamespace
  | R2Bucket
  | D1Database
  | ServiceWorkerGlobalScope;

export class ResourceRegistry {
    private static instances = new Map<string, ResourceType>();

    static register(name: string, resource: ResourceType) {
        this.instances.set(name, resource);
    }

    static get<T extends ResourceType>(name: string): T {
        console.log('get Instances: ', JSON.stringify(this.instances.keys()))
        const resource = this.instances.get(name);
        if (!resource) {
            throw new Error(`Resource "${name}" not registered. Ensure it's properly bound in wrangler.toml`);
        }
        return resource as T;
    }

    static getDurableObject(name: string): DurableObjectNamespace {
        return this.get<DurableObjectNamespace>(name);
    }

    static getKV(name: string): KVNamespace {
        return this.get<KVNamespace>(name);
    }

    static getR2(name: string): R2Bucket {
        return this.get<R2Bucket>(name);
    }

    static getD1(name: string): D1Database {
        return this.get<D1Database>(name);
    }

    static getService(name: string): ServiceWorkerGlobalScope {
        return this.get<ServiceWorkerGlobalScope>(name);
    }
} 