import { FastifyInstance, FastifyPluginOptions } from "fastify";
export interface HttpsAlwaysOptions extends FastifyPluginOptions {
    enabled?: boolean;
    productionOnly?: boolean;
    redirect?: boolean;
    httpsPort?: number;
}
declare function plugin(fastify: FastifyInstance, opts: HttpsAlwaysOptions, next: () => void): void;
export declare const FastifyHttpsAlwaysPlugin: typeof plugin;
export default FastifyHttpsAlwaysPlugin;
