import { entrypoint } from "./utils/auto-worker";
import { MyStatefulObject } from "./stateful";
import { MyStatelessObject } from "./stateless";

// This `types.ts` file handles exporting all of our binding classes for us.
export * from "./types";

// Call directly into a `StatelessObject` which is an alias for Worker
// export default entrypoint(MyStatelessObject);

// Call directly into a `StatefulObject` which is an alias for Durable Object (no Worker needed)
// export default entrypoint(MyStatefulObject);

// Return back without any class implementation
export default entrypoint((request: Request) => {
    const url = new URL(request.url)
    return new Response('hello world: ' + url.pathname);
});
