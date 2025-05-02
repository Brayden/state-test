import { StatefulObject } from "./utils/do-utils";

export class MyStatefulObject extends StatefulObject<Env> {
    static idFromRequest(request: Request): string {
        return "foobarfinman"
    }

    constructor(ctx: DurableObjectState, env: Env) {
        super(ctx, env);
    }

    async fetch(request: Request): Promise<Response> {
        return new Response(`MyStatefulObject: ${MyStatefulObject.idFromRequest!(request)}`);
    }
}
